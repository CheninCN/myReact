import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { EpubView } from 'react-reader'
import { Book } from '../types'
import './EPUBReader.css'

interface EPUBReaderProps {
  book: Book
  onClose: () => void
}

const NAV_LOCK_MS = 500

export default function EPUBReader({ book, onClose }: EPUBReaderProps) {
  const { t } = useTranslation()
  const [location, setLocation] = useState<string | number>(0)
  const [showToc, setShowToc] = useState(false)
  const [toc, setToc] = useState<any[]>([])
  const [showControls, setShowControls] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sliderValue, setSliderValue] = useState(1)
  const epubViewRef = useRef<any>(null)
  const renditionRef = useRef<any>(null)
  const totalPagesRef = useRef(0)
  const sliderActiveRef = useRef(false)
  const navLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!book.epubPath) return
    const loadPageMap = async () => {
      try {
        const res = await fetch(`/api/paginate?book=${encodeURIComponent(book.epubPath!)}`)
        const data = await res.json()
        if (data.totalPages) {
          setTotalPages(data.totalPages)
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

  useEffect(() => {
    if (!sliderActiveRef.current) {
      setSliderValue(currentPage)
    }
  }, [currentPage])

  const clearNavLock = useCallback(() => {
    if (navLockTimerRef.current) {
      clearTimeout(navLockTimerRef.current)
      navLockTimerRef.current = null
    }
  }, [])

  const setNavLock = useCallback(() => {
    clearNavLock()
    navLockTimerRef.current = setTimeout(() => {
      navLockTimerRef.current = null
    }, NAV_LOCK_MS)
  }, [clearNavLock])

  const isNavLocked = useCallback(() => {
    return navLockTimerRef.current !== null
  }, [])

  const handleLocationChanged = useCallback((epubcfi: string) => {
    setLocation(epubcfi)
  }, [])

  const handleTocChange = useCallback((toc: any[]) => {
    setToc(toc)
  }, [])

  const goToPage = useCallback((page: number) => {
    const rend = renditionRef.current
    if (!rend?.book?.locations || totalPagesRef.current <= 0) return
    if (isNavLocked()) return

    setNavLock()
    const pct = (Math.max(1, Math.min(page, totalPagesRef.current)) - 1) / totalPagesRef.current
    const cfi = rend.book.locations.cfiFromPercentage(pct)
    if (!cfi) return

    rend.display(cfi).catch(() => {})
  }, [isNavLock, setNavLock])

  const handleGetRendition = useCallback((rendition: any) => {
    renditionRef.current = rendition

    rendition.book.ready.then(() => {
      return rendition.book.locations.generate(1024)
    }).then(() => {
      if (rendition.book.locations.length() === 0) {
        return rendition.book.locations.generate(512)
      }
    }).catch(() => {})

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
      body: { 'background': '#fff', 'padding': '1.5em 2em', 'line-height': '1.8', 'font-size': '16px' },
      p: { 'text-indent': '2em', 'margin': '0.5em 0' },
      img: { 'max-width': '100%', 'max-height': '90vh', 'height': 'auto', 'display': 'block', 'margin': '1rem auto' },
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
      if (!loc?.start) return
      const total = totalPagesRef.current
      const pct = loc.start.percentage
      if (typeof pct === 'number' && pct >= 0 && total > 0) {
        const page = Math.max(1, Math.min(total, Math.floor(pct * total) + 1))
        setCurrentPage(page)
      }
    })
  }, [])

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPagesRef.current) goToPage(currentPage + 1)
  }, [goToPage])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); handleNextPage() }
    else if (e.key === 'ArrowRight') { e.preventDefault(); handlePrevPage() }
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

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseInt(e.target.value))
  }, [])

  const handleSliderDragStart = useCallback(() => {
    sliderActiveRef.current = true
  }, [])

  const handleSliderDragEnd = useCallback(() => {
    sliderActiveRef.current = false
    goToPage(sliderValue)
  }, [sliderValue, goToPage])

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
          value={sliderValue}
          onChange={handleSliderChange}
          onMouseDown={handleSliderDragStart}
          onTouchStart={handleSliderDragStart}
          onMouseUp={handleSliderDragEnd}
          onTouchEnd={handleSliderDragEnd}
          disabled={totalPages === 0 || loading}
          className="epub-reader__slider"
        />
        <div className="epub-reader__slider-labels">
          <span>{sliderValue}</span>
          <span>{totalPages}</span>
        </div>
      </div>
    </div>
  )
}
