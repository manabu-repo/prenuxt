import { readdirSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async () => {
  try {
    const mdDir = join(process.cwd(), 'md')
    const files = readdirSync(mdDir).filter(f => f.endsWith('.md'))
    
    return files.map(file => ({
      _id: file,
      _path: file.replace('.md', ''),
      title: file.replace(/.md$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    }))
  } catch (error) {
    console.error('Error fetching docs list:', error)
    return []
  }
})
