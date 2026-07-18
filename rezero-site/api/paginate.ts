import type { VercelRequest, VercelResponse } from '@vercel/node'
import { paginateBook } from '../src/lib/paginate'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { book } = req.query

  if (!book || typeof book !== 'string') {
    return res.status(400).json({ error: 'Missing book parameter' })
  }

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const epubUrl = `${protocol}://${host}/${book.replace(/^\/+/, '')}`

    const response = await fetch(epubUrl)
    if (!response.ok) {
      return res.status(404).json({ error: 'Book not found' })
    }

    const arrayBuffer = await response.arrayBuffer()
    const result = await paginateBook(arrayBuffer)
    res.json(result)
  } catch (error) {
    console.error('Pagination error:', error)
    res.status(500).json({ error: 'Failed to paginate book' })
  }
}
