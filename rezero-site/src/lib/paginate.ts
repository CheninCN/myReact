import JSZip from 'jszip'

const CHARS_PER_PAGE_JA = 400

export interface SectionEntry {
  href: string
  startPage: number
  totalPages: number
  charsCount: number
}

export interface PaginationResult {
  totalPages: number
  sectionMap: SectionEntry[]
}

export async function paginateBook(buffer: ArrayBuffer): Promise<PaginationResult> {
  const zip = await JSZip.loadAsync(buffer)

  const containerXml = await zip.file('META-INF/container.xml')?.async('text')
  if (!containerXml) throw new Error('Invalid EPUB: missing container.xml')

  const rootFilePath = extractRootFilePath(containerXml)
  const contentOpf = await zip.file(rootFilePath)?.async('text')
  if (!contentOpf) throw new Error('Invalid EPUB: missing content.opf')

  const opfDir = rootFilePath.substring(0, rootFilePath.lastIndexOf('/') + 1)
  const spine = extractSpine(contentOpf)
  const manifest = extractManifest(contentOpf)

  const sectionMap: SectionEntry[] = []
  let currentPage = 1

  for (let i = 0; i < spine.length; i++) {
    const itemId = spine[i]
    const href = manifest[itemId]
    if (!href) continue

    const fullPath = opfDir + href
    const content = await zip.file(fullPath)?.async('text')
    if (!content) continue

    const cleanText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, '')
    const charCount = [...cleanText].length
    const sectionPages = Math.max(1, Math.ceil(charCount / CHARS_PER_PAGE_JA))

    sectionMap.push({
      href,
      startPage: currentPage,
      totalPages: sectionPages,
      charsCount: charCount,
    })

    currentPage += sectionPages
  }

  return { totalPages: currentPage - 1, sectionMap }
}

function extractRootFilePath(containerXml: string): string {
  const match = containerXml.match(/full-path="([^"]+)"/)
  return match ? match[1] : 'OEBPS/content.opf'
}

function extractSpine(contentOpf: string): string[] {
  const spineMatch = contentOpf.match(/<spine[^>]*>([\s\S]*?)<\/spine>/)
  if (!spineMatch) return []

  const items: string[] = []
  const itemRefs = spineMatch[1].match(/<itemref[^>]*idref="([^"]+)"/g) || []
  for (const itemRef of itemRefs) {
    const match = itemRef.match(/idref="([^"]+)"/)
    if (match) items.push(match[1])
  }
  return items
}

function extractManifest(contentOpf: string): Record<string, string> {
  const manifestMatch = contentOpf.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/)
  if (!manifestMatch) return {}

  const manifest: Record<string, string> = {}
  const items = manifestMatch[1].match(/<item[^>]*\/?>/g) || []
  for (const item of items) {
    const idMatch = item.match(/id="([^"]+)"/)
    const hrefMatch = item.match(/href="([^"]+)"/)
    if (idMatch && hrefMatch) {
      manifest[idMatch[1]] = hrefMatch[1]
    }
  }
  return manifest
}
