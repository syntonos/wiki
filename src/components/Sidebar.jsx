import { useMemo } from 'react'
import { names, notes, title } from '../lib/vault.js'

function build(list) {
  const root = { k: {}, f: [] }
  list.forEach((p) => { let n = root; p.split('/').slice(0, -1).forEach((d) => (n = n.k[d] ??= { k: {}, f: [] })); n.f.push(p) })
  return root
}

function Level({ node, current, go }) {
  return (
    <>
      {Object.keys(node.k).sort().map((d) => (
        <details open key={d}>
          <summary>{d}</summary>
          <div className="kids"><Level node={node.k[d]} current={current} go={go} /></div>
        </details>
      ))}
      {node.f.map((p) => (
        <a key={p} href={'#/' + encodeURI(p)} className={p === current ? 'on' : ''} onClick={() => go(p)}>{title(p)}</a>
      ))}
    </>
  )
}

export default function Sidebar({ current, q, setQ, go }) {
  const tree = useMemo(() => {
    const f = q.toLowerCase()
    return build(names.filter((p) => !f || p.toLowerCase().includes(f) || notes[p].toLowerCase().includes(f)))
  }, [q])
  return (
    <aside className="side"><div className="in">
      <header><a className="brand" href="#/">Vault</a><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes…" /></header>
      <nav><Level node={tree} current={current} go={go} /></nav>
    </div></aside>
  )
}
