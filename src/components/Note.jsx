import { useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/tokyo-night-dark.css'
import 'katex/dist/katex.min.css'
import Quiz, { QuizCtx } from './Quiz.jsx'
import Mermaid from './Mermaid.jsx'
import MathSpan from './MathSpan.jsx'
import { names, notes, title, preprocess, resolveAsset } from '../lib/vault.js'

const isVideo = (u) => /\.(mp4|webm|ogv|mov|m4v)(\?|#|$)/i.test(u)
const text = (n) => n.value ?? (n.children || []).map(text).join('')

function CodeBlock({ node, children }) {
  const [ok, setOk] = useState(false)
  const c = node.children[0]?.properties?.className || []
  if (c.includes('language-quiz') || c.includes('language-mermaid')) return <>{children}</>
  const copy = () => navigator.clipboard?.writeText(text(node)).then(() => { setOk(true); setTimeout(() => setOk(false), 1200) })
  return (
    <div className="codewrap">
      <button className="copy" onClick={copy}>{ok ? 'Copied' : 'Copy'}</button>
      <pre>{children}</pre>
    </div>
  )
}

export default function Note({ id, text: src }) {
  const raw = src ?? notes[id]
  const md = useMemo(() => preprocess(raw), [raw])
  const total = useMemo(() => (md.match(/^```quiz/gm) || []).length, [md])
  const [res, setRes] = useState({})
  const [reset, setReset] = useState(0)
  const ctx = useMemo(() => ({ reset, report: (k, ok) => setRes((r) => { const n = { ...r }; if (ok === undefined) delete n[k]; else n[k] = ok; return n }) }), [reset])
  const score = Object.values(res).filter(Boolean).length
  const i = id ? names.indexOf(id) : -1

  // memoized: a new component identity on every render would remount (and reset) every quiz/diagram
  const components = useMemo(() => ({
    a: ({ href = '', className, children }) =>
      href === '#missing' ? <span className="dead">{children}</span>
      : href.startsWith('#/tag/') ? <a className="tag" href={href}>{children}</a>
      : href.startsWith('#/') ? <a className={className || 'wl'} href={href}>{children}</a>
      : <a href={href} target="_blank" rel="noreferrer">{children}</a>,
    img: ({ src = '', alt = '' }) => {
      const w = (alt.match(/\|(\d+)$/) || [])[1]
      const u = resolveAsset(src, id || '')
      const style = w ? { width: +w } : undefined
      const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
      if (yt) return <iframe src={`https://www.youtube.com/embed/${yt[1]}`} allowFullScreen />
      if (isVideo(u)) return <video controls src={u} style={style} />
      return <img src={u} alt={alt.replace(/\|\d+$/, '')} style={style} />
    },
    pre: CodeBlock,
    'math-tex': ({ node }) => <MathSpan tex={node.properties.dataT ?? ''} display={String(node.properties.dataD) === '1'} />,
    code: ({ className = '', children }) =>
      /language-quiz/.test(className) ? <Quiz src={String(children)} />
      : /language-mermaid/.test(className) ? <Mermaid src={String(children)} />
      : <code className={className}>{children}</code>,
  }), [id])
  return (
    <article className="note">
      {total > 0 && (
        <div className="score"><span>Quiz score {score} / {total}</span>
          <button onClick={() => { setRes({}); setReset((r) => r + 1) }}>Reset</button></div>
      )}
      <QuizCtx.Provider value={ctx}>
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeHighlight, { ignoreMissing: true }]]} components={components}>
          {md}
        </Markdown>
      </QuizCtx.Provider>
      {i >= 0 && (
        <nav className="pn">
          {i > 0 ? <a href={'#/' + encodeURI(names[i - 1])}>← {title(names[i - 1])}</a> : <span />}
          {i < names.length - 1 ? <a href={'#/' + encodeURI(names[i + 1])}>{title(names[i + 1])} →</a> : <span />}
        </nav>
      )}
    </article>
  )
}
