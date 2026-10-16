import { useEffect, useMemo, useRef, useState } from 'react'
import { names, notes, title, allTags } from '../lib/vault.js'

function score(q, s) {
  q = q.toLowerCase(); s = s.toLowerCase()
  const i = s.indexOf(q)
  if (i >= 0) return 100 - i
  let j = 0, sc = 0, last = -2
  for (const c of q) { const k = s.indexOf(c, j); if (k < 0) return 0; sc += k === last + 1 ? 3 : 1; last = k; j = k + 1 }
  return sc
}

// Quick switcher (Ctrl/Cmd+K): fuzzy search over notes, tags and full text.
export default function Switcher({ onClose }) {
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const inp = useRef()
  useEffect(() => inp.current?.focus(), [])
  const items = useMemo(() => {
    const all = [
      { k: '', label: 'Home', sub: '', href: '#/' },
      ...names.map((p) => ({ k: p, label: title(p), sub: p, href: '#/' + encodeURI(p) })),
      ...allTags.map((t) => ({ k: '#' + t, label: '#' + t, sub: 'tag', href: '#/tag/' + encodeURI(t) })),
    ]
    if (!q) return all.slice(0, 10)
    const ql = q.toLowerCase()
    return all.map((x) => ({ ...x, s: Math.max(score(q, x.label) * 2, score(q, x.sub), notes[x.k]?.toLowerCase().includes(ql) ? 1 : 0) }))
      .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 10)
  }, [q])
  useEffect(() => setI(0), [q])
  const go = (it) => { if (it) { location.hash = it.href; onClose() } }
  const key = (e) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(items.length - 1, x + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)) }
    else if (e.key === 'Enter') go(items[i])
  }
  return (
    <div className="sw-back" onClick={onClose}>
      <div className="sw" onClick={(e) => e.stopPropagation()}>
        <input ref={inp} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={key} placeholder="Jump to note or tag…" />
        <div className="sw-list">
          {items.map((it, j) => (
            <a key={it.k + it.href} href={it.href} className={j === i ? 'on' : ''} onMouseEnter={() => setI(j)} onClick={onClose}>
              <span>{it.label}</span><em>{it.sub}</em>
            </a>
          ))}
          {!items.length && <div className="sw-none">No matches</div>}
        </div>
      </div>
    </div>
  )
}
