import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { EpubView } from 'react-reader'
import { Book } from '../types'
import './EPUBReader.css'

interface EPUBReaderProps {
  book: Book
  onClose: () => void
}

interface SectionEntry {
  href: string
  startPage: number
  totalPages: number
  charsCount: number
}

export default function EPUBReader({ book, onClose }: EPUBReaderProps) {
  const { t } = useTranslation()
  const [location, setLocation] = useState<string | number>(0)
  const [showToc, setShowToc] = useState(false)
  const [toc, setToc] = useState<any[]>([])
  const [showControls, setShowControls] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [sectionMap, setSectionMap] = useState<SectionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const epubViewRef = useRef<any>(null)
  const renditionRef = useRef<any>(null)
  const sectionMapRef = useRef<SectionEntry[]>([])
  const totalPagesRef = useRef(0)

  useEffect(() => {
    if (!book.epubPath) return

    const loadPageMap = async () => {
      try {
        const res = await fetch(`/api/paginate?book=${encodeURIComponent(book.epubPath!)}`)
        const data = await res.json()
        if (data.sectionMap) {
          setSectionMap(data.sectionMap)
          setTotalPages(data.totalPages)
          sectionMapRef.current = data.sectionMap
          totalPagesRef.current = data.totalPages
        }
      } catch (err) {
        console.error('Failed to load page map:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPageMap()
  }, [book.epubPath])

  const handleLocationChanged = useCallback((epubcfi: string) => {
    setLocation(epubcfi)
  }, [])

  const handleTocChange = useCallback((toc: any[]) => {
    setToc(toc)
  }, [])

  const handleGetRendition = useCallback((rendition: any) => {
    renditionRef.current = rendition

    rendition.book.ready.then(() => {
      rendition.book.locations.generate(16384).catch(() => {})
    })

    rendition.hooks.content.register((contents: any) => {
      const doc = contents.document
      if (!doc) return
      doc.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        window.parent.postMessage({ type: 'epub-book-click' }, '*')
      })
    })

    rendition.themes.default({
      body: {
        'background': '#fff',
        'padding': '1.5em 2em',
        'line-height': '1.8',
        'font-size': '16px',
      },
      p: {
        'text-indent': '2em',
        'margin': '0.5em 0',
      },
      img: {
        'max-width': '100%',
        'max-height': '90vh',
        'height': 'auto',
        'display': 'block',
        'margin': '1rem auto',
      },
    })

    rendition.hooks.content.register((contents: any) => {
      const doc = contents.document
      if (!doc) return
      const style = doc.createElement('style')
      style.textContent = `
        * { word-break: keep-all; overflow-wrap: break-word; }
        html, body { word-break: keep-all; line-break: strict; column-fill: auto; orphans: 2; widows: 2; }
        img, svg, video { break-inside: avoid; break-after: avoid; }
        h1, h2, h3, h4, h5, h6 { break-after: avoid; }
      `
      doc.head.appendChild(style)
    })

    rendition.on('relocated', (loc: any) => {
      if (loc.start && typeof loc.start.index === 'number') {
        const sectionIndex = loc.start.index
        const percentage = loc.start.percentage || 0
        const map = sectionMapRef.current
        const total = totalPagesRef.current

        if (map[sectionIndex]) {
          const section = map[sectionIndex]
          const page = section.startPage + Math.floor(percentage * section.totalPages)
          setCurrentPage(Math.max(1, Math.min(total, page)))
        }
      }
    })
  }, [])

  const handlePrevPage = useCallback(async () => {
    if (!renditionRef.current) return
    try {
      await renditionRef.current.prev()
    } catch {}
  }, [])

  const handleNextPage = useCallback(async () => {
    if (!renditionRef.current) return
    try {
      await renditionRef.current.next()
    } catch {}
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handleNextPage()
    else if (e.key === 'ArrowRight') handlePrevPage()
    else if (e.key === 'Escape') onClose()
  }, [handleNextPage, handlePrevPage, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'epub-book-click') {
        setShowControls(prev => !prev)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleSliderChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value)
    const map = sectionMapRef.current
    if (map.length === 0 || !renditionRef.current) return

    for (let i = map.length - 1; i >= 0; i--) {
      if (page >= map[i].startPage) {
        await renditionRef.current.display(map[i].href)
        break
      }
    }
  }, [])

  const handleTocClick = useCallback(async (href: string) => {
    if (renditionRef.current) {
      await renditionRef.current.display(href)
      setShowToc(false)
    }
  }, [])

  const handleLeftOverlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    handleNextPage()
  }, [handleNextPage])

  const handleRightOverlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    handlePrevPage()
  }, [handlePrevPage])

  if (!book.epubPath) {
    return (
      <div className="epub-reader">
        <div className="epub-reader__header epub-reader__header--visible">
          <button className="epub-reader__close" onClick={onClose}>✕</button>
          <h2 className="epub-reader__title">{book.title}</h2>
        </div>
        <div className="epub-reader__viewport">
          <div style={{ color: '#fff', textAlign: 'center' }}>{t('books.noEpub')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="epub-reader">
      <div className={`epub-reader__header ${showControls ? 'epub-reader__header--visible' : ''}`}>
        <button className="epub-reader__close" onClick={onClose}>✕</button>
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
            {toc.map((item: any, index: number) => (
              <li key={item.href || index} className={`epub-reader__toc-item level-${item.level || 0}`}>
                <button onClick={() => handleTocClick(item.href)}>{item.label}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="epub-reader__viewport">
        <div className="epub-reader__book-wrapper">
          <div className="epub-reader__click-overlay epub-reader__click-overlay--left" onClick={handleLeftOverlayClick} />
          <div className="epub-container">
            <EpubView
              ref={epubViewRef}
              url={book.epubPath}
              location={location}
              locationChanged={handleLocationChanged}
              tocChanged={handleTocChange}
              epubOptions={{ flow: 'paginated', spread: 'none' }}
              getRendition={handleGetRendition}
            />
          </div>
          <div className="epub-reader__click-overlay epub-reader__click-overlay--right" onClick={handleRightOverlayClick} />
        </div>

        {loading && (
          <div className="epub-reader__loading">
            <div className="epub-reader__spinner"></div>
            <p>{t('books.loading')}</p>
          </div>
        )}
      </div>

      <div className={`epub-reader__slider-container ${showControls ? 'epub-reader__slider-container--visible' : ''}`}>
        <input
          type="range"
          min="1"
          max={totalPages || 1}
          value={currentPage}
          onChange={handleSliderChange}
          disabled={totalPages === 0 || loading}
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
