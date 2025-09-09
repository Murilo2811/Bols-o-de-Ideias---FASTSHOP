import type { Service } from '../types';

// ====================================================================================
// PASSO CRÍTICO DE CONFIGURAÇÃO: INSIRA A URL DO SEU WEBHOOK AQUI
// ====================================================================================
// Para acionar seu fluxo de automação (ex: Zapier, N8N, Make, etc.),
// substitua o valor abaixo pela URL do seu webhook.
//
// Exemplo: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/'
//
// Se esta URL não for alterada, o botão de automação ficará desabilitado.
const WEBHOOK_URL_PLACEHOLDER = 'YOUR_WEBHOOK_URL_HERE';
// FIX: Explicitly type WEBHOOK_URL as a string to prevent TypeScript from inferring a literal type, which causes a comparison error.
const WEBHOOK_URL: string = 'https://hook.us1.make.com/xqovlb26ace5r9mgll13d2gbax2msm7n';

/**
 * Verifica se a URL do webhook foi configurada pelo usuário.
 * @returns {boolean} `true` se a URL for válida, `false` caso contrário.
 */
export const isWebhookConfigured = (): boolean => {
  return WEBHOOK_URL !== WEBHOOK_URL_PLACEHOLDER && !!WEBHOOK_URL;
};

/**
 * Envia dados para um webhook externo.
 * @param payload O objeto de dados a ser enviado no corpo da requisição.
 * @returns Uma promessa que resolve se a requisição for bem-sucedida.
 */
export async function sendToWebhook(payload: object): Promise<void> {
  if (!isWebhookConfigured()) {
    console.error('URL do Webhook não configurada em services/webhookService.ts');
    throw new Error('A URL do Webhook não foi configurada. Verifique o arquivo services/webhookService.ts.');
  }

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao enviar para o webhook: ${response.status} ${response.statusText} - ${errorText}`);
  }
}
