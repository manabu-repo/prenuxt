#!/usr/bin/env node
const { execSync } = require('child_process')
const { existsSync } = require('fs')
const path = require('path')

function findBuildDir() {
  const candidates = ['.output', 'dist', '.nuxt/dist', '.output/public', '.output/server']
  for (const c of candidates) {
    if (existsSync(path.resolve(c))) return path.resolve(c)
  }
  return null
}

const buildDir = findBuildDir()
if (!buildDir) {
  console.error('Could not find build output directory. Searched common locations.')
  process.exit(2)
}

console.log('Checking build output at', buildDir)

// 1) Check for console occurrences
try {
  // Perform a streaming search for 'console.' across files to avoid shell buffer limits.
  const walk = (dir, fileList = []) => {
    const entries = require('fs').readdirSync(dir, { withFileTypes: true })
    for (const e of entries) {
      const res = require('path').resolve(dir, e.name)
      if (e.isDirectory()) walk(res, fileList)
      else fileList.push(res)
    }
    return fileList
  }

  const files = walk(buildDir)
  const matches = []
  for (const f of files) {
    // Only scan likely JS files to save time
    if (!/\.(js|mjs|cjs|ts|vue)$/.test(f)) continue
    try {
      const content = require('fs').readFileSync(f, 'utf8')
      if (content.includes('console.')) {
        matches.push(`${f}: contains console.`)
        if (matches.length >= 50) break
      }
    } catch (e) {
      // ignore read errors
    }
  }

  if (matches.length) {
    console.error('ERROR: Found console.* occurrences in build output (first matches):')
    console.error(matches.slice(0, 50).join('\n'))
    process.exit(1)
  } else {
    console.log('No console.* occurrences found in build output.')
  }
} catch (err) {
  console.error('Error while grepping for console:', err.message)
  process.exit(3)
}

// 2) Check for sourcemaps
try {
  const maps = execSync(`find "${buildDir}" -type f -name "*.map" || true`, { stdio: ['pipe', 'pipe', 'pipe'] }).toString()
  if (maps && maps.trim()) {
    console.log('Found source map files (sample):')
    console.log(maps.split('\n').slice(0,5).join('\n'))
    process.exit(0)
  } else {
    console.warn('No source map files found in build output.')
    process.exit(0)
  }
} catch (err) {
  console.error('Error while searching for sourcemaps:', err.message)
  process.exit(4)
}
