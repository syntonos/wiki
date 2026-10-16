import { useEffect, useState } from 'react'
let seq = 0
// Flow diagrams: ```mermaid fenced blocks. mermaid is loaded lazily, only when a note uses it.
export default function Mermaid({ src }) {
  const [svg, setSvg] = useState('')
  const [err, setErr] = useState('')
  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const m = (await import('mermaid')).default
        m.initialize({
          startOnLoad: false, theme: 'base', securityLevel: 'strict', fontFamily: 'JetBrains Mono, monospace',
          themeVariables: { darkMode: true, background: '#05010b', primaryColor: '#150a2e', primaryTextColor: '#ffffff', primaryBorderColor: '#a99bff',
            lineColor: '#4de1ff', secondaryColor: '#0d0620', tertiaryColor: '#08030f', textColor: '#ffffff', clusterBkg: '#0d0620', edgeLabelBackground: '#05010b' },
        })
        const r = await m.render('mmd' + ++seq, src)
        if (live) { setSvg(r.svg); setErr('') }
      } catch (e) { if (live) setErr(String(e.message || e)) }
    })()
    return () => { live = false }
  }, [src])
  return err ? <pre className="mm-err">{err}</pre> : <div className="mermaid-box" dangerouslySetInnerHTML={{ __html: svg }} />
}
