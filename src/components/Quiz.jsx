import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import Inline from './Inline.jsx'

// Note provides this so quizzes can report results (score bar) and be reset together.
export const QuizCtx = createContext({ report() {}, reset: 0 })

function parse(src) {
  const r = { q: '', ex: '', opts: [], answers: [], shuffle: false }
  src.split('\n').forEach((l) => {
    let m
    if ((m = l.match(/^Q:\s*(.*)/))) r.q = m[1]
    else if ((m = l.match(/^A:\s*(.*)/))) r.answers = m[1].split('|').map((a) => a.trim()).filter(Boolean)
    else if ((m = l.match(/^Shuffle:\s*(yes|true|on)/i))) r.shuffle = true
    else if ((m = l.match(/^-\s*\[( |x)\]\s*(.*)/i))) r.opts.push({ ok: m[1].toLowerCase() === 'x', t: m[2] })
    else if ((m = l.match(/^\?\s*(.*)/))) r.ex = m[1]
  })
  return r
}

export default function Quiz({ src }) {
  const ctx = useContext(QuizCtx)
  const d = useMemo(() => parse(src), [src])
  const [salt, setSalt] = useState(0)
  const [sel, setSel] = useState([])
  const [txt, setTxt] = useState('')
  const [done, setDone] = useState(false)
  const order = useMemo(() => {
    const o = d.opts.map((_, i) => i)
    if (d.shuffle) for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]] }
    return o
  }, [d, ctx.reset, salt])
  const clear = () => { setSel([]); setTxt(''); setDone(false) }
  useEffect(clear, [ctx.reset])

  const fill = d.answers.length > 0
  const multi = d.opts.filter((o) => o.ok).length > 1
  const correct = fill ? d.answers.some((a) => a.toLowerCase() === txt.trim().toLowerCase()) : d.opts.every((o, i) => o.ok === sel.includes(i))
  const pick = (i) => { if (!done) setSel(multi ? (s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]) : [i]) }
  const check = () => { setDone(true); ctx.report(src, correct) }
  const reset = () => { clear(); setSalt((s) => s + 1); ctx.report(src, undefined) } // new shuffle, forget result
  const right = d.opts.filter((o) => o.ok)

  return (
    <div className="quiz">
      <p className="q"><Inline>{d.q}</Inline></p>
      {fill ? (
        <input type="text" value={txt} disabled={done} placeholder="Type your answer…" className={done ? (correct ? 'ok' : 'bad') : ''}
          onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !done && txt.trim() && check()} />
      ) : order.map((i) => {
        const o = d.opts[i], on = sel.includes(i)
        const cls = done ? (on ? (o.ok ? 'ok' : 'bad') : o.ok ? 'miss' : '') : ''
        return (
          <label key={i} className={cls + (done ? ' locked' : '')}>
            <input type={multi ? 'checkbox' : 'radio'} checked={on} disabled={done} onChange={() => pick(i)} />
            <span><Inline>{o.t}</Inline></span>
            {done && (o.ok ? <b className="mark">✓</b> : on ? <b className="mark">✗</b> : null)}
          </label>
        )
      })}
      <div className="qbtns">
        {!done
          ? <button onClick={check} disabled={fill ? !txt.trim() : !sel.length}>Check</button>
          : <button className="alt" onClick={reset}>Reset</button>}
      </div>
      {done && (
        <div className="res">
          <b className={correct ? 'ok' : 'bad'}>{correct ? 'Correct.' : 'Not quite.'}</b>
          <div className="ans">Answer: {fill ? d.answers.join(' / ') : right.map((o, k) => <span key={k}>{k ? ', ' : ''}<Inline>{o.t}</Inline></span>)}</div>
          {d.ex && <div><Inline>{d.ex}</Inline></div>}
        </div>
      )}
    </div>
  )
}
