function replyJson(source: string): Record<string, any> {
  try {
    return JSON.parse(source);
  } catch {
    /* Repair unescaped line breaks inside strings. */
  }
  let out = '',
    quoted = false,
    escaped = false;
  for (const ch of source) {
    if (quoted) {
      if (escaped) {
        escaped = false;
        out += ch;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        out += ch;
        continue;
      }
      if (ch === '"') quoted = false;
      out += ch === '\n' ? '\\n' : ch === '\r' ? '' : ch === '\t' ? '\\t' : ch;
    } else {
      if (ch === '"') quoted = true;
      out += ch;
    }
  }
  return JSON.parse(out);
}
/** CLI conversations accept the original prose + fenced JSON and structured replies. */
export function agentReply(text: string): { text: string; data: Record<string, any> } {
  const blocks = [...text.matchAll(/```(?:json)?\s*({[\s\S]*?})\s*```/gi)];
  const block = blocks.at(-1);
  let data: Record<string, any> = {};
  let prose = text;
  try {
    if (block) {
      data = replyJson(block[1]);
      prose = (text.slice(0, block.index) + text.slice(block.index! + block[0].length)).trim();
    } else if (text.trim().startsWith('{')) {
      data = replyJson(text.trim());
      prose = '';
    }
  } catch {
    return { text, data: {} };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { text, data: {} };
  return {
    text: String(
      data['reply'] ||
        data['message'] ||
        data['say'] ||
        prose ||
        'Atualizei a proposta para você revisar.',
    ),
    data,
  };
}
export function replyLines(value: unknown): string {
  const list = Array.isArray(value) ? value : String(value ?? '').split('\n');
  return list
    .map((v) =>
      typeof v === 'object' && v
        ? [v.term || v.termo || v.title || v.name, v.definition || v.definicao || v.description]
            .filter(Boolean)
            .join(': ')
        : String(v),
    )
    .map((v) => v.trim().replace(/^(?:[-*•]|\d+[.)])\s+/, ''))
    .filter(Boolean)
    .join('\n');
}
export function replyOptions(data: Record<string, any>): { id: string; label: string }[] {
  const ask = Array.isArray(data['ask']) ? data['ask'][0] : data['ask'];
  if (!ask || !Array.isArray(ask.options)) return [];
  const labels = [
    ...new Set<string>(
      ask.options
        .map((o: any) =>
          String(o && typeof o === 'object' ? o.label || '' : (o ?? ''))
            .trim()
            .slice(0, 80),
        )
        .filter(Boolean),
    ),
  ].slice(0, 6);
  return labels.length >= 2 ? labels.map((label) => ({ id: 'answer', label })) : [];
}

export function chatReceipt(messages: { id: string; role: string }[], readId: string): string {
  const last = messages.at(-1);
  return last?.role === 'user' ? (last.id === readId ? 'Lido' : 'Entregue') : '';
}
