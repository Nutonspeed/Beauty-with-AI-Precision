// Script to add Error Boundary to AI pages
import * as fs from 'fs'
import * as path from 'path'

const pages = [
  'app/analysis/page.tsx',
  'app/ai-chat/page.tsx', 
  'app/advanced-ai/page.tsx',
  'app/ar-3d/page.tsx',
  'app/test-ai-performance/page.tsx'
]

pages.forEach(pagePath => {
  const fullPath = path.join(process.cwd(), pagePath)
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Not found: ${pagePath}`)
    return
  }

  let content = fs.readFileSync(fullPath, 'utf8')
  
  // Skip if already has AIErrorBoundary
  if (content.includes('AIErrorBoundary')) {
    console.log(`⏭️  Already protected: ${pagePath}`)
    return
  }

  // Find export default function name
  const match = content.match(/export default (?:async )?function (\w+)\(\)/)
  if (!match) {
    console.log(`❌ Cannot find export default function in: ${pagePath}`)
    return
  }

  const functionName = match[1]
  const contentFunctionName = functionName.replace(/Page$/, 'Content')

  // Add import
  if (!content.includes('@/components/error-boundary')) {
    content = content.replace(
      /^("use client"\n)/m,
      `$1\nimport { AIErrorBoundary } from "@/components/error-boundary"\n`
    )
  }

  // Rename function
  content = content.replace(
    `export default function ${functionName}()`,
    `function ${contentFunctionName}()`
  )
  content = content.replace(
    `export default async function ${functionName}()`,
    `async function ${contentFunctionName}()`
  )

  // Add wrapper at end
  const lastBrace = content.lastIndexOf('}')
  content = content.slice(0, lastBrace + 1) + `\n\nexport default function ${functionName}() {\n  return (\n    <AIErrorBoundary>\n      <${contentFunctionName} />\n    </AIErrorBoundary>\n  )\n}\n`

  fs.writeFileSync(fullPath, content, 'utf8')
  console.log(`✅ Protected: ${pagePath}`)
})

console.log('\n✅ All done!')
