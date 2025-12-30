import { readFileSync } from 'fs'
import { join } from 'path'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path') || ''
  
  try {
    const filePath = join(process.cwd(), 'md', `${path}.md`)
    const content = readFileSync(filePath, 'utf-8')
    const html = md.render(content)
    
    return {
      _path: path,
      title: path.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      content: html,
      _raw: content
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw createError({
        statusCode: 404,
        statusMessage: `Document not found: ${path}`
      })
    }
    console.error('Error fetching doc:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch document'
    })
  }
})
