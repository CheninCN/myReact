import BooksSection from '../components/BooksSection'
import { Book } from '../types'

interface BooksPageProps {
  onSelectBook: (book: Book) => void
}

export default function BooksPage({ onSelectBook }: BooksPageProps) {
  return <BooksSection onSelectBook={onSelectBook} />
}
