import { MATH, mathTag } from './math.js'

// Loads every .md file and media file under /notes at build/dev time.
const rawNotes = import.meta.glob('/notes/**/*.md', { query: '?raw', import: 'default', eager: true })
// (upper-case variants listed because the glob is case-sensitive: photos are often IMG_001.JPG)
const rawAssets = import.meta.glob('/notes/**/*.{png,PNG,jpg,JPG,jpeg,JPEG,gif,GIF,webp,WEBP,svg,SVG,avif,AVIF,bmp,BMP,ico,mp4,MP4,webm,WEBM,mov,MOV,m4v,pdf,PDF}', { query: '?url', import: 'default', eager: true })
const strip = (p) => p.replace(/^\/notes\//, '')

export let notes = {}, assets = {}, names = [], home = '# Home'
export let out = {}, broken = [], tagsOf = {}, tagIndex = {}, allTags = []
export let meta = {}, folderMeta = {}, pinned = [] // ordering / pinning from frontmatter

// ---- frontmatter: "key: value" lines between --- lines ----
const FM = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
function parseFM(t) {
  const m = t.match(FM), fm = {}
  if (m) m[1].split(/\r?\n/).forEach((l) => { const k = l.match(/^([\w-]+):\s*(.*?)\s*$/); if (k) fm[k[1].toLowerCase()] = k[2].replace(/^["']|["']$/g, '') })
  return { fm, body: m ? t.slice(m[0].length) : t }
}
const num = (v) => (v !== undefined && v !== '' && Number.isFinite(+v) ? +v : null)
const yes = (v) => /^(true|yes|on|1)$/i.test(v || '')
const metaOf = (fm) => ({ order: num(fm.order), pin: yes(fm.pin ?? fm.pinned), title: fm.title || '' })

export const title = (p) => meta[p]?.title || (notes[p].match(/^#\s+(.+)$/m) || [])[1] || p.split('/').pop()
export const folderTitle = (path) => folderMeta[path]?.title || path.split('/').pop()
const folderLabel = (path) => path.split('/').map((_, i, a) => folderTitle(a.slice(0, i + 1).join('/'))).join(' / ')

// Sidebar order: at every level folders come first; pinned folders first, then by `order`, then by name (natural: "2" < "10").
function cmpPaths(a, b) {
  const A = a.split('/'), B = b.split('/')
  let i = 0
  while (i < A.length - 1 && i < B.length - 1 && A[i] === B[i]) i++
  const af = i < A.length - 1, bf = i < B.length - 1
  if (af !== bf) return af ? -1 : 1
  const ma = af ? folderMeta[A.slice(0, i + 1).join('/')] : meta[a]
  const mb = bf ? folderMeta[B.slice(0, i + 1).join('/')] : meta[b]
  if (af && !!ma?.pin !== !!mb?.pin) return ma?.pin ? -1 : 1
  const oa = ma?.order ?? Infinity, ob = mb?.order ?? Infinity
  if (oa !== ob) return oa < ob ? -1 : 1
  return A[i].localeCompare(B[i], undefined, { numeric: true, sensitivity: 'base' })
}

export function resolveNote(n) {
  n = decodeURI(n).trim().replace(/\.md$/, '')
  if (!n) return null
  if (notes[n]) return n
  const l = n.toLowerCase()
  return names.find((k) => k.toLowerCase() === l) || names.find((k) => k.split('/').pop().toLowerCase() === l.split('/').pop()) || null
}

export function resolveAsset(src, from = '') {
  if (/^(https?:|data:|blob:)/.test(src)) return src
  let s = src
  try { s = decodeURI(src) } catch {}
  s = s.replace(/^\.\//, '')
  const dir = from.split('/').slice(0, -1).join('/')
  const bare = s.replace(/^\/+/, '').replace(/^notes\//, '')
  for (const c of [dir ? dir + '/' + s : s, s, bare]) if (assets[c]) return assets[c]
  const b = s.split('/').pop().toLowerCase()
  const k = Object.keys(assets).find((k) => k.split('/').pop().toLowerCase() === b)
  if (k) return assets[k]
  // Not a bundled note asset (e.g. a file in public/). A root-absolute path would point at the domain root and
  // break on GitHub Pages project sites (user.github.io/repo/), so make it relative to the page.
  if (s.startsWith('/') && !s.startsWith('//') && typeof document !== 'undefined') return new URL(s.replace(/^\/+/, ''), document.baseURI).href
  return src
}

const ASSET_EXT = /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico|mp4|webm|mov|ogv|m4v|pdf)(\?|#|$)/i
const WIKI = /(?<!!)\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g
const EMBED = /!\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]+)?\]\]/g
const TAG = /(^|[\s(])#([A-Za-z][\w/-]*)/gm
const CODE = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g
const plain = (md) => md.replace(CODE, ' ').replace(MATH, ' ')
const isPdf = (s) => /\.pdf$/i.test(s.trim())

// Build the vault. showDemo=false hides every note in notes/Demo (set in src/App.jsx).
export function init({ showDemo = true } = {}) {
  notes = {}; meta = {}; folderMeta = {}; home = '# Home'
  for (const [p, t] of Object.entries(rawNotes)) {
    const k = strip(p), base = k.split('/').pop()
    if (base === '_home.md') { home = parseFM(t).body.trim() || home; continue }
    if (!showDemo && /^Demo\//i.test(k)) continue
    const { fm, body } = parseFM(t)
    if (base === '_folder.md') { folderMeta[k.split('/').slice(0, -1).join('/')] = metaOf(fm); continue } // folder settings
    if (base.startsWith('_')) continue                                                                       // other "_" files are not notes
    const key = k.replace(/\.md$/, '')
    notes[key] = body.trim(); meta[key] = metaOf(fm)
  }
  assets = Object.fromEntries(Object.entries(rawAssets).map(([p, u]) => [strip(p), u]))
  names = Object.keys(notes).sort(cmpPaths)
  pinned = names.filter((p) => meta[p].pin)
  out = {}; broken = []; tagsOf = {}; tagIndex = {}
  names.forEach((p) => {
    out[p] = new Set(); tagsOf[p] = new Set()
    const t = plain(notes[p])
    for (const m of t.matchAll(WIKI)) {
      if (isPdf(m[1])) continue
      const r = resolveNote(m[1]); if (r) { if (r !== p) out[p].add(r) } else broken.push([p, m[1].trim()])
    }
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
    if (/^[\s>]*$/.test(str.slice(ls, off)) && !after.trim()) return m // own line (a blockquote "> " prefix is fine)
    return `\n\n$$\n${body.trim()}\n$$\n\n`
  })

// tags, wikilinks, embeds (never applied inside code or math)
function rich(s, depth) {
  return s
    .replace(TAG, (_, pre, t) => `${pre}[#${t}](<#/tag/${encodeURI(t.toLowerCase())}>)`)
    .replace(WIKI, (_, n, a) => {
      if (isPdf(n)) return `[${a || n.trim().split('/').pop()}](<${n.trim()}>)` // [[file.pdf]] -> open/download link
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
      .split(MATH).map((m, j) => j % 2 ? mathTag(m) : rich(m, depth)).join('')
  ).join('')
}

// Generated sections appended to the homepage: pinned, index (in sidebar order), tags, unresolved links.
export function indexMd() {
  if (!names.length) return '## Index\n\nNo notes yet. Add `.md` files to the `notes/` folder.'
  const g = new Map()
  names.forEach((p) => { const d = p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : 'General'; if (!g.has(d)) g.set(d, []); g.get(d).push(p) })
  const keys = [...g.keys()].sort((a, b) => (a === 'General' ? -1 : b === 'General' ? 1 : b.startsWith(a + '/') ? -1 : a.startsWith(b + '/') ? 1 : 0)) // General first, parents before sub-folders, else sidebar order
  let s = ''
  if (pinned.length) s += '## Pinned\n\n' + pinned.map((p) => `- [[${p}]]`).join('\n') + '\n\n'
  s += '## Index\n\n' + keys.map((d) => `### ${d === 'General' ? d : folderLabel(d)}\n\n` + g.get(d).map((p) => `- [[${p}]]`).join('\n')).join('\n\n')
  if (allTags.length) s += '\n\n## Tags\n\n' + allTags.map((t) => `- [#${t}](<#/tag/${encodeURI(t)}>) · ${tagIndex[t].length}`).join('\n')
  if (broken.length) s += '\n\n## Unresolved links\n\n' + broken.map(([f, l]) => `- [[${f}]] → \`${l}\``).join('\n')
  return s
}

init() // default; App.jsx calls init() again with its SHOW_DEMO setting before the first render
