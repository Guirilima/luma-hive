export function renderMarkdown(source: string): string {
  const escape = (text: string) =>
    text.replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
    );
  const output: string[] = [];
  let list: { tag: string; items: string[] } | null = null,
    code: string[] | null = null,
    paragraph: string[] = [];
  const inline = (text: string) =>
    escape(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      output.push(
        `<${list.tag}>${list.items.map((item) => `<li>${item}</li>`).join('')}</${list.tag}>`,
      );
      list = null;
    }
  };
  for (const line of String(source || '').split('\n')) {
    if (code) {
      if (/^\s*```/.test(line)) {
        output.push(`<pre><code>${escape(code.join('\n'))}</code></pre>`);
        code = null;
      } else code.push(line);
      continue;
    }
    if (/^\s*```/.test(line)) {
      flushParagraph();
      flushList();
      code = [];
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(6, heading[1].length + 2);
      output.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    const check = line.match(/^\s*[-*]\s+\[( |x|X)\]\s+(.*)/),
      unordered = line.match(/^\s*[-*]\s+(.*)/),
      ordered = line.match(/^\s*\d+[.)]\s+(.*)/);
    if (check || unordered || ordered) {
      flushParagraph();
      const tag = ordered && !unordered ? 'ol' : 'ul';
      if (!list || list.tag !== tag) {
        flushList();
        list = { tag, items: [] };
      }
      list!.items.push(
        check
          ? `<span class="md-check">${check[1].trim() ? '☑' : '☐'}</span> ${inline(check[2])}`
          : inline((unordered || ordered)![1]),
      );
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line.trim());
  }
  if (code) output.push(`<pre><code>${escape(code.join('\n'))}</code></pre>`);
  flushParagraph();
  flushList();
  return output.join('');
}
