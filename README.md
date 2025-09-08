# Bolsão de Ideias: Gestão de Portfólio de Serviços

Bem-vindo ao Bolsão de Ideias! Esta é uma plataforma interativa e segura para sua equipe registrar, analisar, priorizar e explorar um portfólio de ideias de serviços inovadores em um ambiente colaborativo e privado.

## Principais Funcionalidades

- **Sistema de Autenticação Seguro**: O acesso é protegido por login e senha, garantindo que apenas membros autorizados da equipe possam visualizar e gerenciar o portfólio.
- **Controle de Acesso por Função**: Defina permissões para cada usuário (Administrador, Colaborador, Leitor) para garantir a segurança e a integridade dos dados.
- **Banco de Dados Centralizado**: Utiliza uma Planilha Google como banco de dados, permitindo que múltiplos usuários colaborem em tempo real.
- **Explorador de Ideias**: Navegue, filtre e pesquise por todas as ideias do portfólio com um buscador completo.
- **Análise de Clusters**: Visualize a distribuição de ideias em clusters estratégicos e entenda as áreas de maior foco e oportunidade.

### Funções de Usuário (Controle de Acesso)

A plataforma utiliza um sistema de controle de acesso baseado em três funções para garantir a segurança e a organização dos dados:

*   **👑 Administrador**:
    *   **Permissão Total**: Pode criar, editar, priorizar e excluir (arquivar) qualquer ideia no portfólio.
    *   **Uso Ideal**: Para líderes de projeto e gestores que precisam de controle completo sobre a plataforma.

*   **✍️ Colaborador**:
    *   **Pode**: Criar novas ideias, editar informações e atribuir notas de priorização.
    *   **Não Pode**: Excluir (arquivar) ideias. Isso previne a remoção acidental de propostas importantes.
    *   **Uso Ideal**: Para membros da equipe que participam ativamente da construção e avaliação do portfólio.

*   **👀 Leitor**:
    *   **Pode**: Criar novas ideias e visualizar todos os dashboards, relatórios e detalhes das ideias existentes.
    *   **Não Pode**: Editar notas, alterar status ou excluir qualquer ideia.
    *   **Uso Ideal**: Para stakeholders, executivos ou novos membros que precisam consultar o portfólio sem o risco de alterar dados.

Por padrão, **novos usuários são registrados como `Leitor`**. Um `Administrador` deve promover manualmente o usuário na planilha `UsersDB` para `Colaborador` ou `Administrador`.

---

## Configuração Inicial (Essencial)

Para que o aplicativo funcione, você precisa conectá-lo a uma Planilha Google e a um script que servirão como seu backend. Siga os passos abaixo com atenção.

### Parte 1: Criar a Planilha Google (O Banco de Dados)

Esta planilha armazenará todas as suas ideias de serviço e as credenciais dos usuários.

1.  **Crie uma nova Planilha Google**: Acesse [sheets.new](https://sheets.new) e dê um nome à sua planilha (ex: "Bolsão de Ideias - Banco de Dados").

2.  **Configure a Aba de Ideias (`IdeiasDB`)**:
    - Renomeie a primeira página (aba) da sua planilha para `IdeiasDB`.
    - Na primeira linha, crie os seguintes cabeçalhos, **exatamente nesta ordem e com estes nomes**:
        - `id`
        - `service`
        - `need`
        - `cluster`
        - `businessModel`
        - `targetAudience`
        - `status`
        - `creatorName`
        - `creationDate`
        - `score_alinhamento`
        - `score_valor_cliente`
        - `score_impacto_fin`
        - `score_viabilidade`
        - `score_vantagem_comp`
        - `revenue_estimate`

3.  **Configure a Aba de Usuários (`UsersDB`)**:
    - Crie uma **nova página (aba)** na mesma planilha e renomeie-a para `UsersDB`.
    - Na primeira linha desta nova aba, crie os seguintes cabeçalhos:
        - `id`
        - `name`
        - `email`
        - `password`
        - `role`  **(NOVO CAMPO OBRIGATÓRIO)**

4. **Configure a Aba de Ideias Excluídas (`DeletedIdeiasDB`)**:
    - Crie uma **terceira página (aba)** e renomeie-a para `DeletedIdeiasDB`.
    - **Copie e cole a primeira linha (cabeçalhos) da aba `IdeiasDB`** para a primeira linha da `DeletedIdeiasDB`. Isso garante que ambas tenham a mesma estrutura.

### Parte 2: Configurar o Backend (Google Apps Script)

Este script atuará como a ponte (API) entre o aplicativo e sua planilha.

1.  **Abra o Editor de Script**: Na sua Planilha Google, vá em `Extensões` > `Apps Script`.

2.  **Cole o Código do Backend**:
    - Apague todo o conteúdo do arquivo `Code.gs` que possa existir.
    - **Copie todo o código abaixo e cole-o** no editor de Apps Script.

    ```javascript
    // Cole este código COMPLETO no seu arquivo Code.gs
    const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
    const IDEAS_SHEET_NAME = 'IdeiasDB';
    const USERS_SHEET_NAME = 'UsersDB';
    const DELETED_IDEAS_SHEET_NAME = 'DeletedIdeiasDB';

    // Função auxiliar para obter uma aba de forma segura
    const getSheet = (sheetName) => {
      if (!sheetName) {
          throw new Error("Nome da aba (sheetName) não foi fornecido para getSheet.");
      }
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
      if (!sheet) {
          throw new Error(`A aba "${sheetName}" não foi encontrada na planilha. Verifique o nome.`);
      }
      return sheet;
    };
    
    // Converte uma linha da planilha para um objeto de serviço
    const rowToService = (row, headers) => {
        if (!row || !headers) {
            Logger.log("rowToService chamada com parâmetros inválidos (row ou headers).");
            return {};
        }
        const service = {};
        headers.forEach((header, index) => {
            let value = row[index];
            // Converte campos numéricos
            if (['id', 'score_alinhamento', 'score_valor_cliente', 'score_impacto_fin', 'score_viabilidade', 'score_vantagem_comp', 'revenue_estimate'].includes(header)) {
                value = Number(value) || 0;
            }
            service[header] = value;
        });
        
        // Agrupa os scores em um array
        service.scores = [
            service.score_alinhamento, service.score_valor_cliente, service.score_impacto_fin,
            service.score_viabilidade, service.score_vantagem_comp
        ];
        
        // Remove os campos de score individuais
        delete service.score_alinhamento; delete service.score_valor_cliente;
        delete service.score_impacto_fin; delete service.score_viabilidade;
        delete service.score_vantagem_comp;

        return service;
    };

    // Ponto de entrada principal para todas as requisições
    function doPost(e) {
        try {
            const request = JSON.parse(e.postData.contents);
            const { action, payload } = request;
            let result;

            switch (action) {
                case 'getServices': result = doGetServices(); break;
                case 'addService': result = doAddService(payload.service); break;
                case 'updateService': result = doUpdateService(payload.service); break;
                case 'deleteService': result = doDeleteService(payload.id); break;
                case 'loginUser': result = doLoginUser(payload); break;
                case 'registerUser': result = doRegisterUser(payload); break;
                default: throw new Error(`Ação desconhecida: ${action}`);
            }

            return ContentService.createTextOutput(JSON.stringify({ success: true, data: result })).setMimeType(ContentService.MimeType.JSON);
        } catch (error) {
            Logger.log(error);
            return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message })).setMimeType(ContentService.MimeType.JSON);
        }
    }

    function doGetServices() {
        const sheet = getSheet(IDEAS_SHEET_NAME);
        const data = sheet.getDataRange().getValues();
        if (data.length <= 1) return []; // Retorna vazio se só houver cabeçalho
        const headers = data.shift();
        return data.map(row => rowToService(row, headers));
    }

    function doAddService(service) {
        const sheet = getSheet(IDEAS_SHEET_NAME);
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const lastRow = sheet.getLastRow();
        const lastId = lastRow < 2 ? 0 : sheet.getRange(lastRow, 1).getValue();
        const newId = (Number(lastId) || 0) + 1;
        
        const newRow = headers.map(header => {
            if (header === 'id') return newId;
            if (header === 'creationDate') return new Date().toISOString();
            if (header.startsWith('score_')) return 0;
            if (header === 'revenue_estimate') return 0;
            return service[header] || '';
        });

        sheet.appendRow(newRow);
        return rowToService(newRow, headers);
    }

    function doUpdateService(service) {
        const sheet = getSheet(IDEAS_SHEET_NAME);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const idColIndex = headers.indexOf('id');
        if (idColIndex === -1) throw new Error("Coluna 'id' não encontrada na aba IdeiasDB.");
        
        const rowIndexToUpdate = data.findIndex(row => row[idColIndex] == service.id); 

        if (rowIndexToUpdate === -1) throw new Error(`Serviço com id ${service.id} não encontrado.`);
        
        const newRowData = headers.map(header => {
          if (header.startsWith('score_')) {
              const scoreIndex = ['score_alinhamento', 'score_valor_cliente', 'score_impacto_fin', 'score_viabilidade', 'score_vantagem_comp'].indexOf(header);
              return service.scores[scoreIndex] ?? data[rowIndexToUpdate][headers.indexOf(header)];
          }
          if (header === 'revenue_estimate') return service.revenueEstimate;
          return service[header] !== undefined ? service[header] : data[rowIndexToUpdate][headers.indexOf(header)];
        });
        
        sheet.getRange(rowIndexToUpdate + 1, 1, 1, headers.length).setValues([newRowData]);
        return rowToService(newRowData, headers);
    }
    
    function doDeleteService(id) {
        const ideasSheet = getSheet(IDEAS_SHEET_NAME);
        const deletedSheet = getSheet(DELETED_IDEAS_SHEET_NAME);
        
        const data = ideasSheet.getDataRange().getValues();
        const idColIndex = data[0].indexOf('id');
        if (idColIndex === -1) throw new Error("Coluna 'id' não encontrada na aba IdeiasDB.");

        const rowIndexToDelete = data.findIndex(row => row[idColIndex] == id);

        if (rowIndexToDelete === -1) {
            throw new Error(`Serviço com id ${id} não encontrado para exclusão.`);
        }
        
        const rowData = data[rowIndexToDelete];
        deletedSheet.appendRow(rowData);
        
        // O índice da linha na planilha é `rowIndexToDelete + 1` porque o array é 0-indexado
        ideasSheet.deleteRow(rowIndexToDelete + 1);
        
        return { id };
    }

    function doLoginUser({ email, password }) {
      const sheet = getSheet(USERS_SHEET_NAME);
      const data = sheet.getDataRange().getValues();
      const headers = data.shift();
      const emailCol = headers.indexOf('email');
      const passwordCol = headers.indexOf('password');

      const userRow = data.find(row => row[emailCol] === email);
      if (!userRow) throw new Error('Email inválido.');
      if (userRow[passwordCol] !== password) throw new Error('Senha inválida.');

      const user = {};
      headers.forEach((header, index) => {
        if (header !== 'password') user[header] = userRow[index];
      });

      return { user, token: `server_token_${Date.now()}` };
    }

    function doRegisterUser({ name, email, password }) {
      const sheet = getSheet(USERS_SHEET_NAME);
      const data = sheet.getDataRange().getValues();
      const headers = data.shift() || sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const emailCol = headers.indexOf('email');

      if (data.some(row => row[emailCol] === email)) {
        throw new Error('Este email já está em uso.');
      }

      const lastRow = sheet.getLastRow();
      const lastId = lastRow < 2 ? 0 : sheet.getRange(lastRow, 1).getValue();
      const newId = (Number(lastId) || 0) + 1;

      const newUserRow = [newId, name, email, password, 'Leitor'];
      sheet.appendRow(newUserRow);
      
      const user = { id: newId, name, email, role: 'Leitor' };
      return { user, token: `server_token_${Date.now()}` };
    }
    ```

3.  **Implante o Script como um Aplicativo Web**:
    - No canto superior direito, clique em **`Implantar`** > **`Nova implantação`**.
    - Clique no ícone de engrenagem (`⚙️`) e escolha **`Aplicativo da web`**.
    - Preencha os campos:
        - **Descrição**: `API para Bolsão de Ideias`
        - **Executar como**: `Eu ([seu_email@gmail.com])`.
        - **Quem pode acessar**: **`Qualquer pessoa`**.
            > **Atenção**: Esta etapa é **CRUCIAL**. Permite que o aplicativo acesse os dados.
    - Clique em **`Implantar`**.

4.  **Autorize o Script** e **Copie a URL do Aplicativo Web**.

### Parte 3: Conectar o Frontend ao Backend

1.  **Abra o arquivo de serviço**: Navegue até `services/googleSheetService.ts` no seu projeto.

2.  **Atualize a URL**: Encontre a variável `WEB_APP_URL` e substitua a string de placeholder pela URL que você copiou:
    ```typescript
    export const WEB_APP_URL: string = 'https://script.google.com/macros/s/ABCD.../exec';
    ```

3.  **Pronto!** Salve o arquivo. Ao recarregar o aplicativo, ele estará conectado de forma segura à sua Planilha Google. Crie sua primeira conta na tela de registro para começar a usar.

---
## Solução de Problemas e Depuração (Debugging)

Esta seção ajuda a resolver os erros mais comuns que podem ocorrer durante a configuração e o teste do seu backend.

### 🚨 Erro de Depuração: `sheetName: undefined` ou `sheet: <value unavailable>`

<div style="background-color: #fef2f2; border: 1px solid #ef4444; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
  <h3 style="color: #b91c1c; margin-top: 0;"><strong>Está vendo este erro ao usar o depurador?</strong></h3>
  <p>Isso <strong>não é um bug</strong> no código. Acontece porque você está tentando executar uma função auxiliar (como `getSheet` ou `rowToService`) diretamente, sem fornecer as informações que ela precisa para funcionar.</p>
</div>

#### **Como Depurar o Código Corretamente:**

O script foi projetado para ser chamado a partir de funções principais, que são acionadas pelo aplicativo. Para testar ou depurar, você deve sempre executar uma dessas funções principais.

1.  **Selecione a Função Correta:**
    *   No editor do Google Apps Script, ao lado dos botões "Executar" e "Depurar", há um menu suspenso.
    *   **Não** deixe a seleção em `getSheet` ou `rowToService`.
    *   Em vez disso, selecione uma função principal, como **`doGetServices`**. Esta é a melhor função para um teste geral, pois ela lê e processa todos os dados da sua planilha.

2.  **Execute o Depurador:**
    *   Com a função `doGetServices` selecionada, clique no botão **`Depurar`**.
    *   O script agora executará o fluxo completo. Se você colocar um "breakpoint" (ponto de interrupção) dentro da função `getSheet`, verá que desta vez as variáveis `sheetName` e `sheet` terão os valores corretos quando a execução parar ali.

### 🚨 Erro 1: "Ação desconhecida"

<div style="background-color: #fef2f2; border: 1px solid #ef4444; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
  <h3 style="color: #b91c1c; margin-top: 0;"><strong>Este é o erro mais comum após uma atualização do aplicativo.</strong></h3>
  <p>Ele significa que o seu backend (o código no Google Apps Script) está <strong>desatualizado</strong>. O aplicativo está tentando usar uma nova função que ainda não existe no seu script antigo.</p>
</div>

#### **Solução Rápida (3 Passos):**

1.  **Copie o Código Mais Recente:**
    *   Volte para a **[Parte 2: Configurar o Backend](#parte-2-configurar-o-backend-google-apps-script)** deste guia.
    *   Selecione e copie o bloco de código **COMPLETO** fornecido para o `Code.gs`.

2.  **Substitua TODO o Código Antigo:**
    *   No seu editor do Google Apps Script, apague **TODO** o conteúdo do arquivo `Code.gs`.
    *   Cole o novo código que você acabou de copiar. Não tente mesclar ou editar.

3.  **IMPLANTE UMA NOVA VERSÃO (Passo Crucial):**
    *   No canto superior direito, clique em **`Implantar`** > **`Gerenciar implantações`**.
    *   Clique no ícone de lápis (✏️ **Editar**) na sua implantação ativa.
    *   No menu suspenso **"Versão"**, escolha **`Nova versão`**.
    *   Clique em **`Implantar`**.

Isso atualizará seu backend com as novas funções, e o erro desaparecerá após recarregar o aplicativo.

### 🚨 Erro 2: "Erro de Conexão com o Servidor" (Failed to fetch)

<div style="background-color: #fef2f2; border: 1px solid #ef4444; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
  <h3 style="color: #b91c1c; margin-top: 0;"><strong>Está vendo este erro na primeira configuração?</strong></h3>
  <p>Este erro significa que o aplicativo não conseguiu se comunicar com seu backend no Google Apps Script. A causa quase sempre é uma configuração de permissão incorreta. Siga os 3 passos abaixo para resolver.</p>
</div>

#### **Passo 1: Teste a Acessibilidade da sua URL**

O primeiro passo é verificar se a sua URL do backend está publicamente acessível.

1.  Abra o arquivo `services/googleSheetService.ts`.
2.  Copie a URL completa que você colou na constante `WEB_APP_URL`.
3.  Cole essa URL em uma nova aba do navegador e pressione Enter.

**O que você deve ver?**
*   **✅ RESULTADO BOM:** Uma página de erro do Google com o texto `Script function not found: doGet`. Isso é **ótimo**! Significa que sua URL está correta e online. Prossiga para o Passo 2.
*   **❌ RESULTADO RUIM:** Uma página de login do Google ou um erro de "permissão negada". Isso confirma que o problema está nas permissões. **O Passo 2 irá corrigir isso.**

#### **Passo 2: Corrija as Permissões de Acesso (A Causa de 99% dos Casos)**

Esta configuração é **essencial** e a mais comum de ser esquecida.

1.  Volte para o seu projeto do Google Apps Script.
2.  No canto superior direito, clique em **`Implantar`** > **`Gerenciar implantações`**.
3.  Encontre sua implantação ativa (geralmente a única na lista) e clique no ícone de lápis (✏️ **Editar**).
4.  Na janela de configuração, localize a opção **"Quem pode acessar"**.
5.  Altere o valor para **`Qualquer pessoa`**. (Se estiver como "Apenas eu" ou "[Seu email]", o aplicativo não funcionará).
6.  Clique em **`Implantar`**.
    > **Importante**: Não é necessário copiar uma nova URL. Apenas salvar a alteração na implantação existente é o suficiente.

#### **Passo 3: Verifique a Conexão com a Internet**

*   Pode parecer óbvio, mas confirme que seu dispositivo está conectado à internet.

Após completar estes passos, **recarregue a página do aplicativo**. O erro de conexão deverá ter desaparecido. Se o erro persistir, refaça cuidadosamente o Passo 2, pois é a causa mais provável.