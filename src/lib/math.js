import katex from 'katex'

// $$display$$ and $inline$ (a backslash-escaped \$ is not a delimiter)
export const MATH = /(\$\$[\s\S]*?\$\$|(?<![\\$])\$[^$\n]+?\$)/g
export const isDisplay = (m) => m.startsWith('$$')
export const texOf = (m) => m.slice(isDisplay(m) ? 2 : 1, isDisplay(m) ? -2 : -1).replace(/\n[ \t]*>[ \t]?/g, '\n').trim() // also strips blockquote "> " prefixes

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const attr = (s) => esc(s).replace(/\r/g, '').replace(/\n/g, '&#10;').replace(/\|/g, '&#124;').replace(/`/g, '&#96;')

// Math becomes an opaque <math-tex> element so markdown can never mangle the TeX; React renders it with KaTeX.
export const mathTag = (m) => `<math-tex data-d="${isDisplay(m) ? 1 : 0}" data-t="${attr(texOf(m))}"></math-tex>`
export const mathify = (s) => s.split(MATH).map((p, i) => (i % 2 ? mathTag(p) : p)).join('')

export function texHtml(tex, display) {
  try { return katex.renderToString(tex, { displayMode: display, throwOnError: false }) }
  catch { return `<span class="katex-error">${esc(tex)}</span>` }
}
