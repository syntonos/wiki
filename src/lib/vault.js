// Loads every .md file and media file under /notes at build/dev time.
const rawNotes = import.meta.glob('/notes/**/*.md', { query: '?raw', import: 'default', eager: true })
const rawAssets = import.meta.glob('/notes/**/*.{png,jpg,jpeg,gif,webp,svg,mp4,webm,mov}', { query: '?url', import: 'default', eager: true })
const strip = (p) => p.replace(/^\/notes\//, '')

export let notes = {}, assets = {}, names = [], home = '# Home'
export let out = {}, broken = [], tagsOf = {}, tagIndex = {}, allTags = []

export const title = (p) => (notes[p].match(/^#\s+(.+)$/m) || [])[1] || p.split('/').pop()

export function resolveNote(n) {
  n = decodeURI(n).trim().replace(/\.md$/, '')
  if (!n) return null
  if (notes[n]) return n
  const l = n.toLowerCase()
  return names.find((k) => k.toLowerCase() === l) || names.find((k) => k.split('/').pop().toLowerCase() === l.split('/').pop()) || null
}

export function resolveAsset(src, from = '') {
  if (/^(https?:|data:|blob:)/.test(src)) return src
  const s = decodeURI(src)
  const dir = from.split('/').slice(0, -1).join('/')
  for (const c of [dir ? dir + '/' + s : s, s]) if (assets[c]) return assets[c]
  const b = s.split('/').pop().toLowerCase()
  const k = Object.keys(assets).find((k) => k.split('/').pop().toLowerCase() === b)
  return k ? assets[k] : src
}

const ASSET_EXT = /\.(png|jpe?g|gif|webp|svg|mp4|webm|mov|ogv|m4v)(\?|#|$)/i
const WIKI = /(?<!!)\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g
const EMBED = /!\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]+)?\]\]/g
const TAG = /(^|[\s(])#([A-Za-z][\w/-]*)/gm
const CODE = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g
const MATH = /(\$\$[\s\S]*?\$\$|(?<![\\$])\$[^$\n]+?\$)/g
const plain = (md) => md.replace(CODE, ' ').replace(MATH, ' ')


// Build the vault. showDemo=false hides every note in notes/Demo (set in src/App.jsx).
export function init({ showDemo = true } = {}) {
  const keep = (p) => { const k = strip(p); return !k.split('/').pop().startsWith('_') && (showDemo || !/^Demo\//i.test(k)) } // "_" files (e.g. _home.md) are not notes
  notes = Object.fromEntries(
    Object.entries(rawNotes).filter(([p]) => keep(p)).map(([p, t]) => [strip(p).replace(/\.md$/, ''), t.replace(/^---\n[\s\S]*?\n---\n?/, '').trim()])
  )
  assets = Object.fromEntries(Object.entries(rawAssets).map(([p, u]) => [strip(p), u]))
  names = Object.keys(notes).sort((a, b) => a.localeCompare(b))
  home = rawNotes['/notes/_home.md'] || '# Home'
  out = {}; broken = []; tagsOf = {}; tagIndex = {}
  names.forEach((p) => {
    out[p] = new Set(); tagsOf[p] = new Set()
    const t = plain(notes[p])
    for (const m of t.matchAll(WIKI)) { const r = resolveNote(m[1]); if (r) { if (r !== p) out[p].add(r) } else broken.push([p, m[1].trim()]) }
    for (const m of t.matchAll(EMBED)) { if (ASSET_EXT.test(m[1]) || /^https?:/.test(m[1])) continue; const r = resolveNote(m[1]); if (r && r !== p) out[p].add(r) }
    for (const m of t.matchAll(TAG)) tagsOf[p].add(m[2].toLowerCase())
  })
  names.forEach((p) => tagsOf[p].forEach((t) => (tagIndex[t] ??= []).push(p)))
  allTags = Object.keys(tagIndex).sort()
}

export const backlinks = (p) => names.filter((n) => out[n].has(p))

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
const CALLOUT = /^> \[!(\w+)\][+-]?[ \t]*(.*)\n((?:>.*\n?)*)/gm

// A multi-line $$ block that does not start/end on its own line (e.g. "Text: $$" then the formula)
// would swallow the rest of the note, so give it its own lines. Well-formed blocks are left alone.
const fixMath = (s) => s.replace(
  // 1st alternative: single-line $$..$$ (skipped, so pairs stay aligned); 2nd: multi-line $$..$$
  /\$\$(?:[^$\\\n]|\\[^\n])*\$\$|\$\$((?:[^$\\]|\\[\s\S])*?\n(?:[^$\\]|\\[\s\S])*?)\$\$/g,
  (m, body, off, str) => {
    if (body === undefined) return m
    const ls = str.lastIndexOf('\n', off - 1) + 1
    const le = str.indexOf('\n', off + m.length)
    const after = str.slice(off + m.length, le < 0 ? str.length : le)
    if (!str.slice(ls, off).trim() && !after.trim()) return m
    return `\n\n$$\n${body.trim()}\n$$\n\n`
  })

// tags, wikilinks, embeds (never applied inside code or math)
function rich(s, depth) {
  return s
    .replace(TAG, (_, pre, t) => `${pre}[#${t}](<#/tag/${encodeURI(t.toLowerCase())}>)`)
    .replace(WIKI, (_, n, a) => {
      const r = resolveNote(n)
      return r ? `[${a || title(r)}](<#/${encodeURI(r)}>)` : `[${a || n}](<#missing>)`
    })
    .replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, f, w) => {
      const n = f.trim()
      if (!ASSET_EXT.test(n) && !/^https?:/.test(n)) {
        const r = resolveNote(n.split('#')[0])
        if (r) return depth >= 2 ? `[${title(r)}](<#/${encodeURI(r)}>)`
          : `\n\n<div class="embed"><a class="wl embed-title" href="#/${encodeURI(r)}">${esc(title(r))}</a>\n\n${preprocess(notes[r].replace(/^#\s+.+\n?/, ''), depth + 1)}\n\n</div>\n\n`
      }
      return `![${w ? '|' + w : ''}](<${n}>)`
    })
}

// Obsidian syntax -> markdown/HTML. Code and math are left untouched.
export function preprocess(md, depth = 0) {
  return md.split(CODE).map((s, i) => i % 2 ? s :
    fixMath(s.replace(CALLOUT, (_, t, ti, body) => `<div class="callout c-${t.toLowerCase()}">\n<div class="ct">${esc(ti || t)}</div>\n\n${body.replace(/^> ?/gm, '')}\n</div>\n\n`))
      .split(MATH).map((m, j) => j % 2 ? m : rich(m, depth)).join('')
  ).join('')
}

// Generated sections appended to the homepage: index, tags, unresolved links.
export function indexMd() {
  if (!names.length) return '## Index\n\nNo notes yet. Add `.md` files to the `notes/` folder.'
  const g = {}
  names.forEach((p) => { const d = p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : 'General'; (g[d] ??= []).push(p) })
  const keys = Object.keys(g).sort((a, b) => (a === 'General' ? -1 : b === 'General' ? 1 : a.localeCompare(b)))
  let s = '## Index\n\n' + keys.map((d) => `### ${d.replace(/\//g, ' / ')}\n\n` + g[d].map((p) => `- [[${p}]]`).join('\n')).join('\n\n')
  if (allTags.length) s += '\n\n## Tags\n\n' + allTags.map((t) => `- [#${t}](<#/tag/${encodeURI(t)}>) · ${tagIndex[t].length}`).join('\n')
  if (broken.length) s += '\n\n## Unresolved links\n\n' + broken.map(([f, l]) => `- [[${f}]] → \`${l}\``).join('\n')
  return s
}

init() // default; App.jsx calls init() again with its SHOW_DEMO setting before the first render
