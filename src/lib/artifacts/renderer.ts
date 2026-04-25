import { marpCli } from '@marp-team/marp-cli'
import * as fs from 'fs/promises'
import * as path from 'path'
import { randomUUID } from 'crypto'

// Theme files live in public/marp-themes/ — accessible via process.cwd() in both dev and Vercel
function getThemePath(themeFile: string): string {
  return path.join(process.cwd(), 'public', 'marp-themes', themeFile)
}

export async function renderMarkdownToHtml(
  markdown: string,
  themeFile: string
): Promise<string> {
  const id = randomUUID()
  const tmpDir = '/tmp'
  const inputPath = path.join(tmpDir, `${id}.md`)
  const outputPath = path.join(tmpDir, `${id}.html`)
  const themeSrcPath = getThemePath(themeFile)
  const themeTmpPath = path.join(tmpDir, `${id}-theme.css`)

  try {
    // Write markdown and copy theme to /tmp
    await fs.writeFile(inputPath, markdown, 'utf8')
    await fs.copyFile(themeSrcPath, themeTmpPath)

    // Run marp-cli
    const exitCode = await marpCli([
      inputPath,
      '--theme', themeTmpPath,
      '--output', outputPath,
      '--allow-local-files',
      '--html',
    ])

    if (exitCode !== 0) {
      throw new Error(`marp-cli exited with code ${exitCode}`)
    }

    const html = await fs.readFile(outputPath, 'utf8')

    // Inject print-trigger: if ?print=1 in URL, auto-open print dialog
    const printScript = `<script>
if (new URLSearchParams(window.location.search).get('print') === '1') {
  window.addEventListener('load', function() { setTimeout(function() { window.print(); }, 800); });
}
</script>`
    const htmlWithPrint = html.replace('</body>', printScript + '</body>')
    return htmlWithPrint.includes('</body>') ? htmlWithPrint : html + printScript
  } finally {
    // Clean up temp files (best-effort)
    await Promise.allSettled([
      fs.unlink(inputPath),
      fs.unlink(outputPath),
      fs.unlink(themeTmpPath),
    ])
  }
}
