import { useMemo } from 'react'
import { texHtml } from '../lib/math.js'

export default function MathSpan({ tex, display }) {
  const html = useMemo(() => texHtml(tex, display), [tex, display])
  return <span className={display ? 'math-block' : undefined} dangerouslySetInnerHTML={{ __html: html }} />
}
