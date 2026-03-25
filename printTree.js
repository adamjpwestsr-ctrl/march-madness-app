const fs = require('fs')
const path = require('path')

function printTree(dir, prefix = '') {
  const items = fs.readdirSync(dir)

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item === 'node_modules' || item === '.next') continue

    const fullPath = path.join(dir, item)
    const isLast = i === items.length - 1
    const connector = isLast ? '└── ' : '├── '

    console.log(prefix + connector + item)

    if (fs.statSync(fullPath).isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ')
      printTree(fullPath, newPrefix)
    }
  }
}

printTree(process.cwd())
