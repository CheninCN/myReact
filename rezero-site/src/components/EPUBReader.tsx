import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Book, Rendition } from 'epubjs'
import './EPUBReader.css'

interface BookInfo {
  id: string
  title: string
  cover: string
  epubPath: string | null
}

interface EPUBReaderProps {
  book: BookInfo
  onClose: () => void
}

interface TOCItem {
  id: string
  label: string
  href: string
  level: number
}

export default function EPUBReader({ book, onClose }: EPUBReaderProps) {
  const { t } = useTranslation()
  const [bookLoaded, setBookLoaded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [toc, setToc] = useState<TOCItem[]>([])
  const [showToc, setShowToc] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const bookRef = useRef<Book | null>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const sliderRef = useRef<HTMLInputElement>(null)
  const currentPageRef = useRef(1)
  const totalPagesRef = useRef(0)

  const loadBook = useCallback(async () => {
    if (!book.epubPath) return

    try {
      const epubBook = new Book(book.epubPath)
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
            if (item.subitems) {
              collectToc(item.subitems, level + 1)
            }
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

      // 使用 themes 设置样式，epubjs 会正确处理 padding 与 column-width 的关系
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
          'height': 'auto',
          'display': 'block',
          'margin': '1rem auto',
        },
        svg: {
          'max-width': '100%',
          'height': 'auto',
        },
        video: {
          'max-width': '100%',
          'height': 'auto',
        },
        h1: { 'margin': '1em 0 0.5em 0' },
        h2: { 'margin': '1em 0 0.5em 0' },
        h3: { 'margin': '1em 0 0.5em 0' },
        h4: { 'margin': '1em 0 0.5em 0' },
        h5: { 'margin': '1em 0 0.5em 0' },
        h6: { 'margin': '1em 0 0.5em 0' },
      })

      // hooks.content 只注入最小样式，不干扰 epubjs 分页机制
      rendition.hooks.content.register((contents: any) => {
        const doc = contents.document
        if (!doc) return

        const style = doc.createElement('style')
        style.textContent = `
          body {
            user-select: none;
            -webkit-user-select: none;
          }
          img {
            page-break-inside: avoid;
          }
        `
        doc.head.appendChild(style)

        doc.addEventListener('click', (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          window.parent.postMessage({ type: 'epub-book-click' }, '*')
        })
      })

      await rendition.display()

      await epubBook.locations.generate(1000)
      const total = epubBook.locations.length()
      totalPagesRef.current = total
      setTotalPages(total)
      currentPageRef.current = 1
      setCurrentPage(1)
      setBookLoaded(true)

      rendition.on('relocated', (location: any) => {
        if (location.start) {
          const cfi = location.start.cfi
          const loc = epubBook.locations.locationFromCfi(cfi)
          if (typeof loc === 'number' && loc >= 0) {
            const page = loc + 1
            currentPageRef.current = page
            setCurrentPage(page)
            if (sliderRef.current) {
              sliderRef.current.value = String(page)
            }
          }
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
      if (renditionRef.current) {
        renditionRef.current.destroy()
      }
      if (bookRef.current) {
        bookRef.current.destroy()
      }
    }
  }, [loadBook])

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'epub-book-click') {
        setShowControls(!showControls)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [showControls])

  const handlePrevPage = () => {
    if (renditionRef.current) {
      renditionRef.current.prev()
    }
  }

  const handleNextPage = () => {
    if (renditionRef.current) {
      renditionRef.current.next()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handleNextPage()
    } else if (e.key === 'ArrowRight') {
      handlePrevPage()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value)
    if (renditionRef.current && bookRef.current && page > 0) {
      const cfi = bookRef.current.locations.cfiFromLocation(page - 1)
      renditionRef.current.display(cfi)
    }
  }

  const handleTocClick = (href: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(href)
      setShowToc(false)
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
                <button onClick={() => handleTocClick(item.href)}>
                  {item.label}
                </button>
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
        {!bookLoaded && (
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
          ref={sliderRef}
          type="range"
          min="1"
          max={totalPages || 100}
          value={currentPage}
          onChange={handleSliderChange}
          disabled={!bookLoaded}
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
