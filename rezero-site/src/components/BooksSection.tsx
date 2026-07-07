import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Book } from '../types'
import './BooksSection.css'

interface BooksSectionProps {
  onSelectBook: (book: Book) => void
}

const TOTAL_BOOKS = 45
const PAGE_SIZE = 10
const BASE = `${import.meta.env.BASE_URL}online-books/`

export default function BooksSection({ onSelectBook }: BooksSectionProps) {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)

  const books: Book[] = Array.from({ length: TOTAL_BOOKS }, (_, index) => {
    const bookId = String(index + 1).padStart(2, '0')
    if (bookId === '01') {
      return {
        id: bookId,
        title: `${t('books.book')} ${bookId}`,
        cover: `${BASE}covers/test.jpeg`,
        epubPath: `${BASE}books/test.epub`,
      }
    }
    return {
      id: bookId,
      title: `${t('books.book')} ${bookId}`,
      cover: `${BASE}covers/common.png`,
      epubPath: null,
    }
  })

  const totalPages = Math.ceil(TOTAL_BOOKS / PAGE_SIZE)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const currentBooks = books.slice(startIndex, endIndex)

  const handleBookClick = (book: Book) => {
    if (book.epubPath) {
      onSelectBook(book)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <section id="books" className="books-section">
      <div className="books-section__container">
        <h2 className="books-section__title">{t('books.title')}</h2>
        <p className="books-section__subtitle">{t('books.subtitle')}</p>

        <div className="books-grid">
          {currentBooks.map((book) => (
            <div
              key={book.id}
              className={`book-card ${book.epubPath ? 'book-card--clickable' : 'book-card--disabled'}`}
              onClick={() => handleBookClick(book)}
            >
              <div className="book-card__cover">
                <img src={book.cover} alt={book.title} />
              </div>
              <div className="book-card__title">{book.title}</div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button
            className="pagination__btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            {t('books.prev')}
          </button>
          <span className="pagination__info">
            {t('books.page')} {currentPage} {t('books.of')} {totalPages}
          </span>
          <button
            className="pagination__btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            {t('books.next')}
          </button>
        </div>
      </div>
    </section>
  )
}
