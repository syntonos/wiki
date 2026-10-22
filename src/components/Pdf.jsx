import { useState } from 'react'

// Inline PDF viewer (the browser's own viewer) with Open / Download. Spans only, so it is valid inside a paragraph.
export default function Pdf({ src, name = 'document.pdf', height }) {
  const [open, setOpen] = useState(() => innerWidth >= 760) // phones often show only page 1 inline: start collapsed
  return (
    <span className="pdf">
      <span className="pdf-bar">
        <span className="pdf-name">{name}</span>
        <button onClick={() => setOpen(!open)}>{open ? 'Hide' : 'View'}</button>
        <a href={src} target="_blank" rel="noreferrer">Open</a>
        <a href={src} download={name}>Download</a>
      </span>
      {open && <iframe src={src + '#view=FitH'} title={name} style={{ height: height || 640 }} />}
    </span>
  )
}
