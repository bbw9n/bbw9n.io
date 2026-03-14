import fs from 'fs'
import path from 'path'

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
}

export type BlogPost = {
  metadata: Metadata
  slug: string
  content: string
  format: 'mdx' | 'org'
}

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  let frontMatterBlock = match![1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let frontMatterLines = frontMatterBlock.trim().split('\n')
  let metadata: Partial<Metadata> = {}

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(': ')
    let value = valueArr.join(': ').trim()
    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
    metadata[key.trim() as keyof Metadata] = value
  })

  return { metadata: metadata as Metadata, content }
}

function parseOrgFrontmatter(fileContent: string) {
  let metadata: Partial<Metadata> = {}
  let lines = fileContent.split('\n')
  let contentStartIndex = 0

  for (let i = 0; i < lines.length; i++) {
    let match = lines[i].match(/^#\+(\w+):\s*(.*)$/)
    if (match) {
      let key = match[1].toLowerCase()
      let value = match[2].trim()
      if (key === 'title') metadata.title = value
      else if (key === 'date') metadata.publishedAt = value
      else if (key === 'summary') metadata.summary = value
      else if (key === 'image') metadata.image = value
      contentStartIndex = i + 1
    } else if (lines[i].trim() === '') {
      contentStartIndex = i + 1
    } else {
      break
    }
  }

  let content = lines.slice(contentStartIndex).join('\n').trim()
  return { metadata: metadata as Metadata, content }
}

function getPostFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => {
    let ext = path.extname(file)
    return ext === '.mdx' || ext === '.org'
  })
}

function readPostFile(filePath: string): { metadata: Metadata; content: string; format: 'mdx' | 'org' } {
  let rawContent = fs.readFileSync(filePath, 'utf-8')
  let ext = path.extname(filePath)

  if (ext === '.org') {
    let { metadata, content } = parseOrgFrontmatter(rawContent)
    return { metadata, content, format: 'org' }
  }

  let { metadata, content } = parseFrontmatter(rawContent)
  return { metadata, content, format: 'mdx' }
}

function getPostData(dir: string): BlogPost[] {
  let files = getPostFiles(dir)
  return files.map((file) => {
    let { metadata, content, format } = readPostFile(path.join(dir, file))
    let slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      content,
      format,
    }
  })
}

export function getBlogPosts() {
  return getPostData(path.join(process.cwd(), 'app', 'blog', 'posts'))
}

export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date()
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  let targetDate = new Date(date)

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  let daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`
  } else {
    formattedDate = 'Today'
  }

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
}
