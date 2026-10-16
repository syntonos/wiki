import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Note provides this so quizzes can report results (score bar) and be reset together.
export const QuizCtx = createContext({ report() {}, reset: 0 })

function parse(src) {
  const r = { q: '', ex: '', opts: [], answers: [], shuffle: false }
  src.split('\n').forEach((l) => {
    let m
    if ((m = l.match(/^Q:\s*(.*)/))) r.q = m[1]
    else if ((m = l.match(/^A:\s*(.*)/))) r.answers = m[1].split('|').map((a) => a.trim().toLowerCase()).filter(Boolean)
    else if ((m = l.match(/^Shuffle:\s*(yes|true|on)/i))) r.shuffle = true
    else if ((m = l.match(/^-\s*\[( |x)\]\s*(.*)/i))) r.opts.push({ ok: m[1].toLowerCase() === 'x', t: m[2] })
    else if ((m = l.match(/^\?\s*(.*)/))) r.ex = m[1]
  })
  return r
}

export default function Quiz({ src }) {
  const ctx = useContext(QuizCtx)
  const d = useMemo(() => parse(src), [src])
  const order = useMemo(() => {
    const o = d.opts.map((_, i) => i)
    if (d.shuffle) for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]] }
    return o
  }, [d, ctx.reset])
  const [sel, setSel] = useState([])
  const [txt, setTxt] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => { setSel([]); setTxt(''); setDone(false) }, [ctx.reset])

  const fill = d.answers.length > 0
  const multi = d.opts.filter((o) => o.ok).length > 1
  const correct = fill ? d.answers.includes(txt.trim().toLowerCase()) : d.opts.every((o, i) => o.ok === sel.includes(i))
  const touch = () => { if (done) { setDone(false); ctx.report(src, false) } }
  const pick = (i) => { touch(); setSel(multi ? (s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]) : [i]) }
  const check = () => { setDone(true); ctx.report(src, correct) }

  return (
    <div className="quiz">
      <p className="q">{d.q}</p>
      {fill ? (
        <input type="text" value={txt} placeholder="Type your answer…" className={done ? (correct ? 'ok' : 'bad') : ''}
          onChange={(e) => { touch(); setTxt(e.target.value) }} onKeyDown={(e) => e.key === 'Enter' && txt.trim() && check()} />
      ) : order.map((i) => {
        const o = d.opts[i]
        return (
          <label key={i} className={done ? (sel.includes(i) ? (o.ok ? 'ok' : 'bad') : o.ok ? 'miss' : '') : ''}>
            <input type={multi ? 'checkbox' : 'radio'} checked={sel.includes(i)} onChange={() => pick(i)} />
            <span>{o.t}</span>
          </label>
        )
      })}
      <button onClick={check} disabled={fill ? !txt.trim() : !sel.length}>Check</button>
      {done && (
        <div className="res"><b className={correct ? 'ok' : 'bad'}>{correct ? 'Correct. ' : 'Not quite. '}</b>
          {!correct && fill && <>Answer: {d.answers[0]}. </>}{d.ex}</div>
      )}
    </div>
  )
}
