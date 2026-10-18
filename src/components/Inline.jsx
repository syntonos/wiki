import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import MathSpan from './MathSpan.jsx'
import { mathify } from '../lib/math.js'

// Inline markdown + math ($...$) for short strings (quiz questions, options, explanations)
export default function Inline({ children }) {
  return (
    <Markdown
      rehypePlugins={[rehypeRaw]}
      components={{
        p: ({ children }) => <>{children}</>,
        'math-tex': ({ node }) => <MathSpan tex={node.properties.dataT ?? ''} display={String(node.properties.dataD) === '1'} />,
      }}
    >
      {mathify(String(children ?? ''))}
    </Markdown>
  )
}
