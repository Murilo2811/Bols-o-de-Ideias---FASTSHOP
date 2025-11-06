import type { Service, User } from '../types';

// ====================================================================================
// PASSO CRÍTICO DE CONFIGURAÇÃO: INSIRA A URL DO SEU BACKEND AQUI
// ====================================================================================
// Para conectar o aplicativo à sua Planilha Google, substitua o valor abaixo
// pela URL do seu Aplicativo Web do Google Apps Script que você copiou na etapa de implantação.
//
// Exemplo: 'https://script.google.com/macros/s/SUA_ID_UNICA_AQUI/exec'
//
// ATENÇÃO: A partir desta versão, o modo de demonstração foi removido.
// A inserção de uma URL de backend válida é OBRIGATÓRIA para o funcionamento do aplicativo.
export const WEB_APP_URL: string = 'https://script.google.com/macros/s/AKfycbxbkCsRnV85dmmVGgreu9R-z5-orZZtHVRdzoSODWZ_yn0YVe_A129GV3E5iMiX7UCd/exec';


interface AuthResponse {
    user: User;
    token: string;
}

export async function apiRequest<T>(action: string, payload?: object): Promise<T> {
    if (!WEB_APP_URL || WEB_APP_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE')) {
        throw new Error('A URL do backend (Google Apps Script) não foi configurada. Verifique o arquivo services/googleSheetService.ts.');
    }

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action, payload }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        if (result.success === false) {
            throw new Error(result.error || 'Ocorreu um erro desconhecido na API.');
        }
        return result.data as T;

    } catch (error: any) {
        console.error(`Falha na ação "${action}":`, error);
        throw new Error(`Não foi possível se comunicar com o servidor. Verifique sua conexão. Detalhes: ${error.message}`);
    }
}


// --- Funções de Serviço ---

const serviceToSheetData = (service: Partial<Service>) => ({
    id: service.id,
    service: service.service,
    need: service.need,
    cluster: service.cluster,
    businessModel: service.businessModel,
    targetAudience: service.targetAudience || '',
    status: service.status || 'avaliação',
    creatorName: service.creatorName || '',
    creationDate: service.creationDate || '',
    score_alinhamento: service.scores?.[0] ?? 0,
    score_valor_cliente: service.scores?.[1] ?? 0,
    score_impacto_fin: service.scores?.[2] ?? 0,
    score_viabilidade: service.scores?.[3] ?? 0,
    score_vantagem_comp: service.scores?.[4] ?? 0,
    revenue_estimate: service.revenueEstimate ?? 0,
});

export const getServices = (): Promise<Service[]> => apiRequest<Service[]>('getServices');
export const addServiceToSheet = (service: Omit<Service, 'id' | 'creationDate' | 'scores' | 'revenueEstimate'>): Promise<Service> => apiRequest<Service>('addService', { service });
export const updateServiceInSheet = (service: Service): Promise<Service> => apiRequest<Service>('updateService', { service: serviceToSheetData(service) });
export const deleteServiceFromSheet = (id: number): Promise<{ id: number }> => apiRequest<{ id: number }>('deleteService', { id });

export const loginUser = (email: string, password: string): Promise<AuthResponse> =>
  apiRequest<AuthResponse>('loginUser', { email, password });

export const registerUser = (name: string, email: string, password: string): Promise<AuthResponse> =>
  apiRequest<AuthResponse>('registerUser', { name, email, password });