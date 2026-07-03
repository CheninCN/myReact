import BooksSection from '../components/BooksSection'

interface Book {
  id: string
  title: string
  cover: string
  epubPath: string | null
}

interface BooksPageProps {
  onSelectBook: (book: Book) => void
}

export default function BooksPage({ onSelectBook }: BooksPageProps) {
  return <BooksSection onSelectBook={onSelectBook} />
}
