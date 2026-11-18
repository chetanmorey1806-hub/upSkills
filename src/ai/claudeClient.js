// Browser-side Claude client for the AI practice tools.
// Students paste THEIR OWN Anthropic API key; it is kept only in this browser (localStorage)
// and sent directly to api.anthropic.com. Never put a shared/school key into this app.
import Anthropic from '@anthropic-ai/sdk';

export const MODELS = [
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5 – most capable (default)' },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5 – fast & capable' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5 – fastest, lowest cost' },
];
export const EFFORTS = ['low', 'medium', 'high'];
// Approximate list prices per 1M tokens (input, output) – for the cost estimate only.
export const PRICES = { 'claude-opus-5-5': [4, 20], 'claude-sonnet-5-5': [2, 10], 'claude-haiku-5-5': [0.1, 0.5] };

const KEY = 'xlpbi-anthropic-key';
export const getApiKey = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
export const setApiKey = (k) => { try { if (k) localStorage.setItem(KEY, k); else localStorage.removeItem(KEY); } catch { /* ignore */ } };

// Models that support the server-side refusal fallback ("default" routing).
const FALLBACK_MODELS = new Set(['claude-opus-5-5', 'claude-sonnet-5-5']);

/**
 * Stream a reply. onText(delta) is called for every text chunk.
 * Returns { text, message } where message is the final Message (usage, stop_reason …).
 */
export async function streamClaude({ apiKey, model, system, messages, effort = 'medium', onText, signal }) {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const params = {
    model,
    max_tokens: 16000,
    messages,
    output_config: { effort },
    ...(system && system.trim() ? { system } : {}),
  };
  const stream = FALLBACK_MODELS.has(model)
    ? client.beta.messages.stream({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }, { signal })
    : client.messages.stream(params, { signal });

  let text = '';
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      text += event.delta.text;
      onText?.(event.delta.text);
    }
  }
  const message = await stream.finalMessage();
  return { text, message };
}

export function describeError(err) {
  if (err instanceof Anthropic.AuthenticationError) return 'Invalid API key. Check the key you pasted (it starts with "sk-ant-").';
  if (err instanceof Anthropic.PermissionDeniedError) return 'This API key is not allowed to use this model.';
  if (err instanceof Anthropic.RateLimitError) return 'Rate limited – wait a few seconds and try again.';
  if (err instanceof Anthropic.BadRequestError) return `Bad request: ${err.message}`;
  if (err instanceof Anthropic.APIConnectionError) return 'Could not reach the Claude API. Check your internet connection.';
  if (err instanceof Anthropic.APIError) return `API error ${err.status ?? ''}: ${err.message}`;
  if (err?.name === 'AbortError' || err instanceof Anthropic.APIUserAbortError) return 'Stopped.';
  return String(err?.message || err);
}

export function stopNote(message) {
  if (!message) return '';
  if (message.stop_reason === 'refusal') return `The model declined this request${message.stop_details?.category ? ` (${message.stop_details.category})` : ''}. Try rephrasing it.`;
  if (message.stop_reason === 'max_tokens') return 'The reply hit the length limit and was cut off.';
  return '';
}

export function costOf(model, usage) {
  const p = PRICES[model];
  if (!p || !usage) return null;
  return ((usage.input_tokens || 0) * p[0] + (usage.output_tokens || 0) * p[1]) / 1e6;
}
