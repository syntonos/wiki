import { useMemo } from 'react'
import { names, notes, title, folderTitle } from '../lib/vault.js'

// `names` is already in display order (folders first, then `order`, then name), so first appearance = display order.
function build(list) {
  const root = { k: [], f: [] }
  list.forEach((p) => {
    let n = root, acc = ''
    p.split('/').slice(0, -1).forEach((d) => {
      acc = acc ? acc + '/' + d : d
      let c = n.k.find((x) => x.name === d)
      if (!c) { c = { name: d, path: acc, k: [], f: [] }; n.k.push(c) }
      n = c
    })
    n.f.push(p)
  })
  return root
}

function Level({ node, current, go }) {
  return (
    <>
      {node.k.map((c) => (
        <details open key={c.path}>
          <summary>{folderTitle(c.path)}</summary>
          <div className="kids"><Level node={c} current={current} go={go} /></div>
        </details>
      ))}
      {node.f.map((p) => (
        <a key={p} href={'#/' + encodeURI(p)} className={p === current ? 'on' : ''} onClick={() => go(p)}>{title(p)}</a>
      ))}
    </>
  )
}

export default function Sidebar({ current, q, setQ, go, pinned = [], onUnpin }) {
  const tree = useMemo(() => {
    const f = q.toLowerCase()
    return build(names.filter((p) => !f || p.toLowerCase().includes(f) || notes[p].toLowerCase().includes(f)))
  }, [q, names])
  return (
    <aside className="side"><div className="in">
      <header><a className="brand" href="#/">Vault</a><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes…" /></header>
      <nav>
        {!q && pinned.length > 0 && (
          <div className="pinsec">
            <div className="pinhd">Pinned</div>
            {pinned.map(({ p, local }) => (
              <div className="pinrow" key={p}>
                <a href={'#/' + encodeURI(p)} className={p === current ? 'on' : ''} onClick={() => go(p)}>{title(p)}</a>
                {local && <button className="unpin" title="Unpin" onClick={() => onUnpin(p)}>×</button>}
              </div>
            ))}
          </div>
        )}
        <Level node={tree} current={current} go={go} />
      </nav>
    </div></aside>
  )
}
