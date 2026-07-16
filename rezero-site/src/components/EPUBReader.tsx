import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Book as EpubBook, Rendition } from 'epubjs'
import { Book } from '../types'
import './EPUBReader.css'

interface EPUBReaderProps {
  book: Book
  onClose: () => void
}

interface TOCItem {
  id: string
  label: string
  href: string
  level: number
}

interface PageMapEntry {
  href: string
  startPage: number
  pages: number
  startPct: number
  endPct: number
}

const CACHE_KEY_PREFIX = 'epub-pagemap-v1-'

function getCacheKey(book: Book): string {
  return CACHE_KEY_PREFIX + book.epubPath
}

function loadCachedPageMap(book: Book): { pageMap: PageMapEntry[]; totalPages: number } | null {
  try {
    const raw = localStorage.getItem(getCacheKey(book))
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function savePageMapCache(book: Book, pageMap: PageMapEntry[], totalPages: number) {
  try {
    localStorage.setItem(getCacheKey(book), JSON.stringify({ pageMap, totalPages }))
  } catch {}
}

async function prePaginateBook(
  epubBook: EpubBook,
  styleText: string,
  width: number,
  height: number,
  onProgress: (pct: number, sectionName: string) => void,
  abortRef: { current: boolean }
): Promise<{ pageMap: PageMapEntry[]; totalPages: number }> {
  const spine = (epubBook.spine as any).items as any[]
  if (spine.length === 0) return { pageMap: [], totalPages: 0 }

  const hiddenContainer = document.createElement('div')
  hiddenContainer.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:${height}px;overflow:hidden;visibility:hidden;pointer-events:none;z-index:-1;`
  document.body.appendChild(hiddenContainer)

  let totalChars = 0
  const charCounts: number[] = []

  for (const item of spine) {
    if (abortRef.current) break
    try {
      const doc = await epubBook.section(item.href).load()
      const cc = doc.body?.textContent?.length || 0
      charCounts.push(cc)
      totalChars += cc
    } catch {
      charCounts.push(0)
    }
  }

  if (abortRef.current) {
    document.body.removeChild(hiddenContainer)
    return { pageMap: [], totalPages: 0 }
  }

  const pageMap: PageMapEntry[] = []
  let cumulativePages = 0
  let cumulativeChars = 0

  for (let i = 0; i < spine.length; i++) {
    if (abortRef.current) break
    const item = spine[i]
    const charCount = charCounts[i]

    try {
      const doc = await epubBook.section(item.href).load()

      const iframe = document.createElement('iframe')
      iframe.style.cssText = `width:${width}px;height:${height}px;border:none;`
      hiddenContainer.appendChild(iframe)

      const hiddenDoc = iframe.contentDocument
      if (hiddenDoc) {
        hiddenDoc.open()
        hiddenDoc.write(
          `<html><head><meta charset="utf-8"><style>${styleText}</style></head><body>${doc.body?.innerHTML || ''}</body></html>`
        )
        hiddenDoc.close()

        await new Promise((r) => setTimeout(r, 80))

        const hiddenBody = hiddenDoc.body
        const scrollWidth = hiddenBody?.scrollWidth || 0
        const computedCW = hiddenBody ? getComputedStyle(hiddenBody).columnWidth : 'auto'
        const columnWidth =
          computedCW && computedCW !== 'auto' ? parseInt(computedCW) : width
        const pages = Math.max(1, Math.ceil(scrollWidth / Math.max(1, columnWidth)))

        pageMap.push({
          href: item.href,
          startPage: cumulativePages + 1,
          pages,
          startPct: totalChars > 0 ? cumulativeChars / totalChars : 0,
          endPct: totalChars > 0 ? (cumulativeChars + charCount) / totalChars : 0,
        })

        cumulativePages += pages
        cumulativeChars += charCount
        hiddenContainer.removeChild(iframe)
      }
    } catch {
      const avgPages = Math.max(1, Math.round(cumulativePages / Math.max(1, pageMap.length)))
      pageMap.push({
        href: item.href,
        startPage: cumulativePages + 1,
        pages: avgPages,
        startPct: totalChars > 0 ? cumulativeChars / totalChars : 0,
        endPct: totalChars > 0 ? (cumulativeChars + charCount) / totalChars : 0,
      })
      cumulativePages += avgPages
      cumulativeChars += charCount
    }

    onProgress(Math.round(((i + 1) / spine.length) * 100), item.href || `Section ${i + 1}`)
    await new Promise((r) => setTimeout(r, 0))
  }

  document.body.removeChild(hiddenContainer)
  return { pageMap, totalPages: cumulativePages }
}

function findVisualPage(
  pageMap: PageMapEntry[],
  location: any,
  totalLocations: number,
  epubBook: EpubBook
): number {
  if (pageMap.length === 0) return 1

  let currentPct = location.start?.percentage
  if (typeof currentPct !== 'number') {
    const loc = epubBook.locations.locationFromCfi(location.start?.cfi)
    currentPct = totalLocations > 0 ? Number(loc) / totalLocations : 0
  }

  const entry = pageMap.find((e) => currentPct >= e.startPct && currentPct < e.endPct)

  if (entry) {
    const range = entry.endPct - entry.startPct
    const ratio = range > 0 ? (currentPct - entry.startPct) / range : 0
    const pageInSection = Math.max(1, Math.ceil(ratio * entry.pages))
    return entry.startPage + pageInSection - 1
  }

  const lastEntry = pageMap[pageMap.length - 1]
  const totalPages = lastEntry.startPage + lastEntry.pages - 1
  return Math.max(1, Math.ceil(currentPct * totalPages))
}

export default function EPUBReader({ book, onClose }: EPUBReaderProps) {
  const { t } = useTranslation()
  const [bookLoaded, setBookLoaded] = useState(false)
  const [paginating, setPaginating] = useState(false)
  const [paginationProgress, setPaginationProgress] = useState(0)
  const [paginationSection, setPaginationSection] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [toc, setToc] = useState<TOCItem[]>([])
  const [showToc, setShowToc] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const bookRef = useRef<EpubBook | null>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const pageMapRef = useRef<PageMapEntry[]>([])
  const totalLocationsRef = useRef(0)
  const pendingNavRef = useRef<'prev' | 'next' | null>(null)
  const isNavigatingRef = useRef(false)
  const abortRef = useRef(false)

  const processNavigation = useCallback(async () => {
    if (isNavigatingRef.current) return
    if (!renditionRef.current) return
    const action = pendingNavRef.current
    if (!action) return

    pendingNavRef.current = null
    isNavigatingRef.current = true

    const navPromise =
      action === 'prev' ? renditionRef.current.prev() : renditionRef.current.next()
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Navigation timeout')), 3000)
    )

    try {
      await Promise.race([navPromise, timeoutPromise])
    } catch (e) {
      console.error(`Navigation ${action} failed:`, e)
      if (renditionRef.current) {
        try {
          await renditionRef.current.display()
        } catch {}
      }
    } finally {
      isNavigatingRef.current = false
      if (pendingNavRef.current) {
        setTimeout(() => processNavigation(), 200)
      }
    }
  }, [])

  const loadBook = useCallback(async () => {
    if (!book.epubPath) return
    abortRef.current = false

    try {
      const epubBook = new EpubBook(book.epubPath)
      bookRef.current = epubBook
      await epubBook.ready

      const navigation = await epubBook.loaded.navigation
      const tocItems: TOCItem[] = []
      const collectToc = (items: any[], level: number = 0) => {
        items.forEach((item) => {
          if (item.href) {
            tocItems.push({
              id: item.id || item.href,
              label: item.label || item.href,
              href: item.href,
              level,
            })
            if (item.subitems) collectToc(item.subitems, level + 1)
          }
        })
      }
      collectToc(navigation.toc || [])
      setToc(tocItems)

      const rendition = epubBook.renderTo('epub-container', {
        width: '100%',
        height: '100%',
        flow: 'paginated',
        spread: 'none',
      })
      renditionRef.current = rendition

      rendition.themes.default({
        body: {
          background: '#fff',
          padding: '1.5em 2em',
          'line-height': '1.8',
          'font-size': '16px',
        },
        p: { 'text-indent': '2em', margin: '0.5em 0' },
        img: { 'max-width': '100%', 'max-height': '90vh', height: 'auto', display: 'block', margin: '1rem auto' },
        svg: { 'max-width': '100%', height: 'auto' },
        video: { 'max-width': '100%', height: 'auto' },
        h1: { margin: '1em 0 0.5em 0' },
        h2: { margin: '1em 0 0.5em 0' },
        h3: { margin: '1em 0 0.5em 0' },
        h4: { margin: '1em 0 0.5em 0' },
        h5: { margin: '1em 0 0.5em 0' },
        h6: { margin: '1em 0 0.5em 0' },
      })

      rendition.hooks.content.register((contents: any) => {
        const doc = contents.document
        if (!doc) return
        const style = doc.createElement('style')
        style.textContent = `
          * { word-break: keep-all; overflow-wrap: break-word; -webkit-hyphens: none; hyphens: none; }
          html, body { user-select: none; -webkit-user-select: none; word-break: keep-all; line-break: strict; column-fill: auto; orphans: 2; widows: 2; }
          img, svg, video, figure, table { break-inside: avoid; -webkit-column-break-inside: avoid; break-after: avoid; }
          h1, h2, h3, h4, h5, h6 { break-after: avoid; -webkit-column-break-after: avoid; }
        `
        doc.head.appendChild(style)
        doc.addEventListener('click', (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          window.parent.postMessage({ type: 'epub-book-click' }, '*')
        })
      })

      await rendition.display()
      await new Promise<void>((resolve) => {
        rendition.on('rendered', () => resolve())
      })

      await epubBook.locations.generate(160)
      totalLocationsRef.current = epubBook.locations.length()

      const containerEl = document.getElementById('epub-container')
      const mainIframe = containerEl?.querySelector('iframe')
      const mainDoc = mainIframe?.contentDocument
      const styleTags = mainDoc?.head?.querySelectorAll('style') || []
      const styleText = Array.from(styleTags).map((s) => s.textContent || '').join('\n')
      const width = containerEl?.clientWidth || 800
      const height = containerEl?.clientHeight || 600

      const cached = loadCachedPageMap(book)
      if (cached && cached.pageMap.length > 0) {
        pageMapRef.current = cached.pageMap
        setTotalPages(cached.totalPages)
        setCurrentPage(1)
        setBookLoaded(true)
      } else {
        setPaginating(true)
        setPaginationProgress(0)

        const { pageMap, totalPages } = await prePaginateBook(
          epubBook,
          styleText,
          width,
          height,
          (pct, sectionName) => {
            setPaginationProgress(pct)
            setPaginationSection(sectionName)
          },
          abortRef
        )

        if (!abortRef.current && pageMap.length > 0) {
          pageMapRef.current = pageMap
          setTotalPages(totalPages)
          setCurrentPage(1)
          savePageMapCache(book, pageMap, totalPages)
        }

        setPaginating(false)
        setBookLoaded(true)
      }

      rendition.on('relocated', (location: any) => {
        if (location.start && pageMapRef.current.length > 0) {
          const page = findVisualPage(
            pageMapRef.current,
            location,
            totalLocationsRef.current,
            epubBook
          )
          setCurrentPage(page)
        }
      })
    } catch (error) {
      console.error('Failed to load EPUB:', error)
      setBookLoaded(true)
    }
  }, [book.epubPath])

  useEffect(() => {
    loadBook()
    return () => {
      abortRef.current = true
      if (renditionRef.current) renditionRef.current.destroy()
      if (bookRef.current) bookRef.current.destroy()
    }
  }, [loadBook])

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'epub-book-click') setShowControls(!showControls)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [showControls])

  const handlePrevPage = () => {
    pendingNavRef.current = 'prev'
    processNavigation()
  }

  const handleNextPage = () => {
    pendingNavRef.current = 'next'
    processNavigation()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handleNextPage()
    else if (e.key === 'ArrowRight') handlePrevPage()
    else if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSliderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value)
    if (!bookRef.current || !renditionRef.current || pageMapRef.current.length === 0) return

    const entry = pageMapRef.current.find(
      (e) => page >= e.startPage && page < e.startPage + e.pages
    )
    if (entry) {
      const pageInSection = page - entry.startPage + 0.5
      const ratio = pageInSection / entry.pages
      const targetPct = entry.startPct + ratio * (entry.endPct - entry.startPct)
      const cfi = bookRef.current.locations.cfiFromPercentage(targetPct)
      await renditionRef.current.display(cfi)
    }
  }

  const handleTocClick = async (href: string) => {
    if (renditionRef.current && !isNavigatingRef.current) {
      isNavigatingRef.current = true
      try {
        await renditionRef.current.display(href)
        setShowToc(false)
      } catch (e) {
        console.error('TOC click error:', e)
      } finally {
        isNavigatingRef.current = false
      }
    }
  }

  const handleLeftOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleNextPage()
  }

  const handleRightOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handlePrevPage()
  }

  return (
    <div className="epub-reader">
      <div
        className={`epub-reader__header ${showControls ? 'epub-reader__header--visible' : ''}`}
      >
        <button className="epub-reader__close" onClick={onClose}>
          ✕
        </button>
        <h2 className="epub-reader__title">{book.title}</h2>
        <div className="epub-reader__header-right">
          <button className="epub-reader__toc-btn" onClick={() => setShowToc(!showToc)}>
            {t('books.toc')}
          </button>
          <div className="epub-reader__page-info">
            <span>{currentPage}</span>
            <span className="epub-reader__page-separator">/</span>
            <span>{totalPages}</span>
          </div>
        </div>
      </div>

      {showToc && toc.length > 0 && (
        <div className="epub-reader__toc">
          <h3 className="epub-reader__toc-title">{t('books.toc')}</h3>
          <ul className="epub-reader__toc-list">
            {toc.map((item) => (
              <li key={item.id} className={`epub-reader__toc-item level-${item.level}`}>
                <button onClick={() => handleTocClick(item.href)}>{item.label}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="epub-reader__viewport">
        <div className="epub-reader__book-wrapper">
          <div
            className="epub-reader__click-overlay epub-reader__click-overlay--left"
            onClick={handleLeftOverlayClick}
          />
          <div id="epub-container" className="epub-container"></div>
          <div
            className="epub-reader__click-overlay epub-reader__click-overlay--right"
            onClick={handleRightOverlayClick}
          />
        </div>

        {paginating && (
          <div className="epub-reader__pagination-overlay">
            <div className="epub-reader__pagination-content">
              <div className="epub-reader__pagination-spinner"></div>
              <p className="epub-reader__pagination-title">{t('books.paginating')}</p>
              <div className="epub-reader__pagination-bar-track">
                <div
                  className="epub-reader__pagination-bar-fill"
                  style={{ width: `${paginationProgress}%` }}
                />
              </div>
              <p className="epub-reader__pagination-pct">{paginationProgress}%</p>
              <p className="epub-reader__pagination-section">{paginationSection}</p>
            </div>
          </div>
        )}

        {!bookLoaded && !paginating && (
          <div className="epub-reader__loading">
            <div className="epub-reader__spinner"></div>
            <p>{t('books.loading')}</p>
          </div>
        )}
      </div>

      <div
        className={`epub-reader__slider-container ${showControls ? 'epub-reader__slider-container--visible' : ''}`}
      >
        <input
          type="range"
          min="1"
          max={totalPages || 1}
          value={currentPage}
          onChange={handleSliderChange}
          disabled={!bookLoaded || paginating}
          className="epub-reader__slider"
        />
        <div className="epub-reader__slider-labels">
          <span>1</span>
          <span>{totalPages}</span>
        </div>
      </div>
    </div>
  )
}
