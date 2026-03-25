const fs = require('fs')
const path = require('path')

/**
 * CONFIG — where your Supabase client actually lives
 */
const correctPath = 'lib/supabaseClient'

/**
 * Files that may import Supabase
 */
const targetExtensions = ['.ts', '.tsx', '.js']

/**
 * Recursively walk the project
 */
function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    if (file === 'node_modules' || file === '.next') continue

    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      walk(fullPath, fileList)
    } else {
      const ext = path.extname(fullPath)
      if (targetExtensions.includes(ext)) {
        fileList.push(fullPath)
      }
    }
  }

  return fileList
}

/**
 * Compute relative import path from a file to /lib/supabaseClient
 */
function computeRelativeImport(filePath) {
  const fileDir = path.dirname(filePath)
  const absoluteTarget = path.join(process.cwd(), correctPath)
  let relative = path.relative(fileDir, absoluteTarget)

  // Normalize Windows backslashes → forward slashes
  relative = relative.replace(/\\/g, '/')

  // Remove .js extension if present
  if (relative.endsWith('.js')) {
    relative = relative.slice(0, -3)
  }

  // Ensure it starts with "./" or "../"
  if (!relative.startsWith('.')) {
    relative = './' + relative
  }

  return relative
}

/**
 * Update Supabase imports in a file
 */
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content

  const relativeImport = computeRelativeImport(filePath)

  // Regex to match ANY supabaseClient import
  const regex =
    /import\s+{?\s*supabase\s*}?\s*from\s*['"][^'"]*supabaseClient[^'"]*['"]/g

  content = content.replace(regex, `import { supabase } from '${relativeImport}'`)

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`✔ Fixed: ${filePath}`)
  }
}

/**
 * Run the script
 */
console.log('Scanning project for Supabase imports...\n')

const allFiles = walk(process.cwd())

allFiles.forEach(fixFile)

console.log('\nDone! All Supabase imports updated.')
