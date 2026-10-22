import { useEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Note from './components/Note.jsx'
import Graph from './components/Graph.jsx'
import Switcher from './components/Switcher.jsx'
import { init, pinned as filePinned, names, out, backlinks, resolveNote, title, home, indexMd, allTags, tagIndex } from './lib/vault.js'

const OWNER_NAME = 'MINA YEH'          // <- placeholder: put a name here
const SITE_URL = 'https://minayeh.com'  // <- where the star + name link to
const GITHUB_URL = 'https://github.com/syntonos/'          // <- your GitHub
const INSTAGRAM_URL = 'https://instagram.com/'
const SNAP = 130, MIN = 200, MAX = 520  // drag a panel below SNAP px and it snaps closed
// Show the bundled notes/Demo folder (usage instructions + feature demos)? false = hide it everywhere
// (sidebar, graph, search, tags, index). Code-only switch.
const SHOW_DEMO = false
init({ showDemo: SHOW_DEMO })

const Svg = ({ children }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{children}</svg>
const Burger = () => <Svg><path d="M4 6h16M4 12h16M4 18h16" /></Svg>
const Cross = () => <Svg><path d="M5 5l14 14M19 5L5 19" /></Svg>
const PanelIcon = () => <Svg><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16" /></Svg>
const Search = () => <Svg><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></Svg>
const Star = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--acc)"><path d="M12 1C13 8 16 11 23 12C16 13 13 16 12 23C11 16 8 13 1 12C8 11 11 8 12 1Z" /></svg>

const GitHub = () => <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
const Insta = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
const Socials = () => (
  <div className="soc">
    <a className="owner" href={SITE_URL} target="_blank" rel="noreferrer"><Star /><span>{OWNER_NAME}</span></a>
    <a className="tab ic" href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub"><GitHub /></a>
    <a className="tab ic" href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram"><Insta /></a>
  </div>
)

const parse = (h) => {
  let r = ''
  try { r = decodeURI(h.slice(2)) } catch { r = h.slice(2) }
  const t = r.match(/^tag\/(.+)$/), g = r.match(/^graph\/(.+)$/)
  return { r, tag: t ? t[1].toLowerCase() : null, g: g ? g[1].toLowerCase() : null }
}
const loadUI = () => { try { return JSON.parse(localStorage.getItem('vault.ui') || '{}') } catch { return {} } }

export default function App() {
  const isMob = () => innerWidth < 760
  const [ui] = useState(loadUI)
  const [hash, setHash] = useState(location.hash)
  const [view, setView] = useState(parse(location.hash).g ? 'graph' : 'note')
  const [gtag, setGtag] = useState(parse(location.hash).g)
  const [sw, setSw] = useState(false)
  const [q, setQ] = useState('')
  const [mobile, setMobile] = useState(isMob())
  const [lw, setLw] = useState(isMob() ? 0 : ui.lw ?? 280)
  const [rw, setRw] = useState(isMob() ? 0 : ui.rw ?? 300)
  const [drag, setDrag] = useState(false)
  const [toc, setToc] = useState([])
  const [pins, setPins] = useState(() => { try { return JSON.parse(localStorage.getItem('vault.pins') || '[]') } catch { return [] } })
  useEffect(() => { try { localStorage.setItem('vault.pins', JSON.stringify(pins)) } catch {} }, [pins])
  const last = useRef({ l: ui.l || 280, r: ui.r || 300 })
  const wasMob = useRef(isMob())

  const P = parse(hash)
  const tag = P.tag
  const id = names.length && !P.tag && !P.g ? resolveNote(P.r) : null // null = homepage / tag page / graph route
  const page = tag ? 'tag:' + tag : id ?? 'home'

  useEffect(() => {
    const f = () => { const p = parse(location.hash); setHash(location.hash); setView(p.g ? 'graph' : 'note'); if (p.g) setGtag(p.g); if (isMob()) { setLw(0); setRw(0) } }
    const r = () => {
      const m = isMob()
      if (m !== wasMob.current) { wasMob.current = m; setMobile(m); setLw(m ? 0 : last.current.l); setRw(m ? 0 : last.current.r) }
    }
    const k = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSw((x) => !x) }
      else if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName)) { e.preventDefault(); setSw(true) }
    }
    addEventListener('hashchange', f); addEventListener('resize', r); addEventListener('keydown', k)
    return () => { removeEventListener('hashchange', f); removeEventListener('resize', r); removeEventListener('keydown', k) }
  }, [])

  // remember panel widths / open state (desktop)
  useEffect(() => {
    if (mobile || drag) return
    try { localStorage.setItem('vault.ui', JSON.stringify({ lw, rw, l: last.current.l, r: last.current.r })) } catch {}
  }, [lw, rw, mobile, drag])

  // Table of contents from rendered headings (h1-h3)
  useEffect(() => {
    if (view !== 'note') return
    const hs = [...document.querySelectorAll('.note h1, .note h2, .note h3')]
    const seen = {}
    const clean = (h) => { const c = h.cloneNode(true); c.querySelectorAll('.katex-mathml').forEach((e) => e.remove()); return (c.textContent || '').trim() }
    hs.forEach((h) => { // ids are readable names (e.g. #flow-diagram), not numbers
      const b = clean(h).toLowerCase().trim().replace(/[^\p{L}\p{N}]+/g, '-').replace(/^-|-$/g, '') || 'section'
      seen[b] = (seen[b] || 0) + 1
      h.id = seen[b] > 1 ? `${b}-${seen[b]}` : b
    })
    setToc(hs.map((h) => ({ id: h.id, l: +h.tagName[1], t: clean(h) })))
  }, [page, view])

  const drawer = () => Math.round(Math.min(320, innerWidth * 0.88))
  const toggle = (side) => {
    const [w, set, setOther] = side === 'l' ? [lw, setLw, setRw] : [rw, setRw, setLw]
    if (w) set(0)
    else { set(mobile ? drawer() : last.current[side]); if (mobile) setOther(0) }
  }
  const startDrag = (side) => (e) => {
    e.preventDefault(); setDrag(true)
    const set = side === 'l' ? setLw : setRw
    const move = (ev) => {
      const raw = side === 'l' ? ev.clientX : innerWidth - ev.clientX
      if (raw < SNAP) set(0)
      else { const w = Math.min(MAX, Math.max(MIN, raw)); last.current[side] = w; set(w) }
    }
    const up = () => { setDrag(false); removeEventListener('pointermove', move); removeEventListener('pointerup', up) }
    addEventListener('pointermove', move); addEventListener('pointerup', up)
  }
  const go = (p) => { location.hash = '#/' + encodeURI(p); setView('note') }
  const Link = ({ p }) => <a href={'#/' + encodeURI(p)}>{title(p)}</a>
  const minL = Math.min(...toc.map((t) => t.l))
  // pinned: from notes' frontmatter (pin: true) + this browser's own pins (right panel button)
  const pinList = [...filePinned.map((p) => ({ p, local: false })), ...pins.filter((p) => names.includes(p) && !filePinned.includes(p)).map((p) => ({ p, local: true }))]
  const togglePin = (p) => setPins((x) => (x.includes(p) ? x.filter((y) => y !== p) : [...x, p]))
  const isFilePin = id && filePinned.includes(id)
  const isPin = id && (isFilePin || pins.includes(id))
  const homeText = home + '\n\n' + indexMd()
  const tagText = tag ? `# Tag: ${tag}\n\n` + (tagIndex[tag] || []).map((p) => `- [[${p}]]`).join('\n') + `\n\n[View in graph](#/graph/${encodeURI(tag)})` : ''
  const heading = id ? title(id) : tag ? '#' + tag : view === 'graph' ? 'Graph' : 'Home'

  return (
    <div className={'app' + (drag ? ' drag' : '') + (mobile ? ' mob' : '')} style={{ '--lw': lw + 'px', '--rw': rw + 'px' }}>
      <header className="bar">
        <button className="ic" title={lw ? 'Close sidebar' : 'Open sidebar'} onClick={() => toggle('l')}>{lw ? <Cross /> : <Burger />}</button>
        <span className="lstar"><Star /></span>
        <span className="ntitle">{heading}</span>
        <button className="ic" title="Search (Ctrl/Cmd+K)" onClick={() => setSw(true)}><Search /></button>
        <a className={'tab' + (id === null && !tag && view === 'note' ? ' on' : '')} href="#/" onClick={() => setView('note')}>Home</a>
        <button className={view === 'note' && (id || tag) ? 'on' : ''} onClick={() => { setView('note'); if (id === null && !tag && names.length) go(names[0]) }}>Note</button>
        <button className={view === 'graph' ? 'on' : ''} onClick={() => setView('graph')}>Graph</button>
        <Socials />
        <button className="ic" title={rw ? 'Close panel' : 'Open panel'} onClick={() => toggle('r')}>{rw ? <Cross /> : <PanelIcon />}</button>
      </header>
      <div className="body">
        <Sidebar current={id} q={q} setQ={setQ} go={go} pinned={pinList} onUnpin={togglePin} />
        <main>
          <div className="grip l" onPointerDown={startDrag('l')} />
          <div className="grip r" onPointerDown={startDrag('r')} />
          <div className="view">
            {view === 'graph' ? (
              <div className="gview">
                <Graph current={id} onOpen={go} tag={gtag} />
                {allTags.length > 0 && (
                  <div className="tagbar">
                    <button className={'chip' + (!gtag ? ' on' : '')} onClick={() => setGtag(null)}>All</button>
                    {allTags.map((t) => <button key={t} className={'chip' + (gtag === t ? ' on' : '')} onClick={() => setGtag(t)}>#{t}</button>)}
                  </div>
                )}
              </div>
            ) : tag ? <Note text={tagText} key={page} /> : id ? <Note id={id} key={id} /> : <Note text={homeText} key="home" />}
          </div>
        </main>
        <aside className="right"><div className="in">
          {id && <>
            <button className={'pinbtn' + (isPin ? ' on' : '')} disabled={isFilePin} onClick={() => togglePin(id)}>
              {isFilePin ? '★ Pinned (in note file)' : isPin ? '★ Unpin from sidebar' : '☆ Pin to sidebar'}
            </button>
            <h4>Local graph</h4>
            <div className="mini"><Graph current={id} onOpen={go} local /></div>
            <h4>Backlinks</h4>
            <div className="list">{backlinks(id).map((p) => <Link key={p} p={p} />)}{!backlinks(id).length && <em>None</em>}</div>
            <h4>Outgoing links</h4>
            <div className="list">{[...out[id]].map((p) => <Link key={p} p={p} />)}{!out[id].size && <em>None</em>}</div>
          </>}
          <h4>Contents</h4>
          <div className="list toc">
            {view !== 'note' && <em>Open a note</em>}
            {view === 'note' && toc.map((t) => (
              <a key={t.id} href={'#' + t.id} style={{ paddingLeft: (t.l - minL) * 14 }}
                 onClick={(e) => { e.preventDefault(); document.querySelector('.note #' + CSS.escape(t.id))?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>{t.t}</a>
            ))}
            {view === 'note' && !toc.length && <em>No headings</em>}
          </div>
          <div className="soc-m"><h4>Links</h4><Socials /></div>
        </div></aside>
      </div>
      {sw && <Switcher onClose={() => setSw(false)} />}
      {mobile && (lw > 0 || rw > 0) && <div className="scrim" onClick={() => { setLw(0); setRw(0) }} />}
    </div>
  )
}
