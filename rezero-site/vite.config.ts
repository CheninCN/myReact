import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { paginateBook } from './src/lib/paginate'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/paginate')) {
            const url = new URL(req.url!, `http://${req.headers.host}`)
            const book = url.searchParams.get('book')

            if (!book) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Missing book parameter' }))
              return
            }

            const bookPath = path.resolve(process.cwd(), 'public', book.replace(/^\/+/, ''))

            if (!fs.existsSync(bookPath)) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Book not found' }))
              return
            }

            try {
              const fileBuffer = fs.readFileSync(bookPath)
              const result = await paginateBook(fileBuffer.buffer)
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(result))
            } catch (error) {
              console.error('Pagination error:', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to paginate book' }))
            }
          } else {
            next()
          }
        })
      },
    },
  ],
})
