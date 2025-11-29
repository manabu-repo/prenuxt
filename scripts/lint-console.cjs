#!/usr/bin/env node
const { readdirSync, readFileSync, statSync } = require('fs')
const { resolve, extname } = require('path')

const root = process.cwd()
const includeDirs = ['app', 'components', 'pages', 'composables', 'server']
const exts = ['.js', '.ts', '.vue', '.mjs', '.cjs']

function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const res = resolve(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(res))
    else files.push(res)
  }
  return files
}

const matches = []
for (const d of includeDirs) {
  const dir = resolve(root, d)
  try {
    const files = walk(dir)
    for (const f of files) {
      if (!exts.includes(extname(f))) continue
      const content = readFileSync(f, 'utf8')
      if (content.includes('console.')) {
        matches.push(f)
        if (matches.length >= 50) break
      }
    }
  } catch (e) {
    // ignore missing dirs
  }
}

if (matches.length) {
  console.error('Found console.* in source files (first matches):')
  console.error(matches.join('\n'))
  process.exit(1)
}

console.log('No console.* occurrences found in scanned source directories.')
