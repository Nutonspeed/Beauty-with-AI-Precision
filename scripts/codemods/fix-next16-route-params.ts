/**
 * Codemod: Update Next.js App Router route handlers to Next 16 param typing
 * - Replace second arg `{ params }: { params: ... }` with `context: { params: Promise<any> }`
 * - Insert `const params = await context.params;` at top of the function body if missing
 *
 * Safe to re-run. Only touches files under app/api/**/route.ts
 */
import fs from 'fs'
import path from 'path'
import glob from 'glob'

const ROOT = process.cwd()
const pattern = path.join(ROOT, 'app', 'api', '**', 'route.ts')

const files = glob.sync(pattern, { nodir: true })

const methodNames = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

let changedCount = 0

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8')
  const original = src

  // Quick skip if already using context Promise in this file
  const alreadyModern = src.includes('context: { params: Promise<')

  // Replace all destructured params in function signature with context Promise
  // Matches variations like: , { params }: { params: { id: string } }
  const sigRe = /,\s*\{\s*params\s*\}:\s*\{\s*params\s*:\s*[^}]+\}\s*\)/g
  if (sigRe.test(src)) {
    src = src.replace(sigRe, ', context: { params: Promise<any> })')
  }

  // For each method, ensure the `const params = await context.params;` is present
  for (const name of methodNames) {
    // Find function start
    const fnStartRe = new RegExp(
      `export\\s+async\\s+function\\s+${name}\\s*\\(\\s*[^)]*context:\\s*\\{\\s*params: \\w+<[^>]*>\\s*\\}[^)]*\\)\\s*\\{`,
      'm'
    )

    const match = src.match(fnStartRe)
    if (!match) continue

    // Determine insertion point right after the opening brace
    const idx = match.index! + match[0].length

    // Check if params line already exists within next few lines
    const tail = src.slice(idx, idx + 200)
    const hasLine = /const\s+params\s*=\s*await\s*context\.params\s*;/.test(tail)

    if (!hasLine) {
      src = src.slice(0, idx) + `\n  const params = await context.params;` + src.slice(idx)
    }
  }

  if (src !== original) {
    fs.writeFileSync(file, src, 'utf8')
    changedCount++
    console.log(`[codemod] Updated: ${path.relative(ROOT, file)}`)
  }
}

console.log(`[codemod] Completed. Files changed: ${changedCount}`)
