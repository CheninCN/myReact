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
  const [pageContent, setPageContent] = useState('')
  const bookRef = useRef<Book | null>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const sliderRef = useRef<HTMLInputElement>(null)

  const loadBook = useCallback(async () => {
    if (!book.epubPath) return

    try {
      const epubBook = new Book(book.epubPath)
      bookRef.current = epubBook

      await epubBook.ready

      const spineItems: any[] = []
      epubBook.spine.each((item: any) => {
        spineItems.push(item)
      })
      setTotalPages(spineItems.length)

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
          }
          if (item.subitems) {
            collectToc(item.subitems, level + 1)
          }
        })
      }
      collectToc(navigation.toc || [])
      setToc(tocItems)

      const rendition = epubBook.renderTo('epub-container', {
        width: '100%',
        height: '100%',
        flow: 'paginated',
      })
      renditionRef.current = rendition

      rendition.display()

      rendition.on('rendered', () => {
        setBookLoaded(true)
      })

      rendition.on('pageChanged', (location: any) => {
        const page = location.start?.index || 0
        setCurrentPage(page + 1)
        if (sliderRef.current) {
          sliderRef.current.value = String(page + 1)
        }
      })
    } catch (error) {
      console.error('Failed to load EPUB:', error)
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

  const handlePrevPage = () => {
    if (currentPage > 1 && renditionRef.current) {
      renditionRef.current.prev()
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages && renditionRef.current) {
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
  }, [currentPage, totalPages, onClose])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value)
    if (renditionRef.current) {
      renditionRef.current.display(page - 1)
    }
  }

  const handleTocClick = (href: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(href)
      setShowToc(false)
    }
  }

  return (
    <div className="epub-reader" onClick={(e) => e.stopPropagation()}>
      <div className="epub-reader__header">
        <button className="epub-reader__close" onClick={onClose}>
          ✕
        </button>
        <h2 className="epub-reader__title">{book.title}</h2>
        <button className="epub-reader__toc-btn" onClick={() => setShowToc(!showToc)}>
          {t('books.toc')}
        </button>
      </div>

      <div className="epub-reader__content">
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
          <div id="epub-container" className="epub-container"></div>
          {!bookLoaded && (
            <div className="epub-reader__loading">
              <div className="epub-reader__spinner"></div>
              <p>{t('books.loading')}</p>
            </div>
          )}
        </div>

        <div className="epub-reader__controls">
          <button
            className="epub-reader__nav-btn"
            onClick={handlePrevPage}
            disabled={!bookLoaded || currentPage <= 1}
          >
            ◀ {t('books.nextPage')}
          </button>

          <div className="epub-reader__page-info">
            <span>{currentPage}</span>
            <span className="epub-reader__page-separator">/</span>
            <span>{totalPages}</span>
          </div>

          <button
            className="epub-reader__nav-btn"
            onClick={handleNextPage}
            disabled={!bookLoaded || currentPage >= totalPages}
          >
            {t('books.prevPage')} ▶
          </button>
        </div>

        <div className="epub-reader__slider-container">
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

        <div className="epub-reader__hints">
          <p>{t('books.hintLeft')}</p>
          <p>{t('books.hintRight')}</p>
          <p>{t('books.hintEsc')}</p>
        </div>
      </div>
    </div>
  )
}
