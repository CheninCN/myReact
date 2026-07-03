import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import SnowParticles from './components/SnowParticles'
import ScrollToTop from './components/ScrollToTop'
import RouteTransition from './components/RouteTransition'
import HomePage from './pages/HomePage'
import CharactersPage from './pages/CharactersPage'
import EpisodesPage from './pages/EpisodesPage'
import WorldPage from './pages/WorldPage'
import BooksPage from './pages/BooksPage'
import EPUBReader from './components/EPUBReader'
import './App.css'

interface Book {
  id: string
  title: string
  cover: string
  epubPath: string | null
}

function App() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book)
  }

  const handleCloseReader = () => {
    setSelectedBook(null)
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="app">
        <SnowParticles />
        <Navigation />
        <RouteTransition>
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/characters" element={<CharactersPage />} />
              <Route path="/episodes" element={<EpisodesPage />} />
              <Route path="/world" element={<WorldPage />} />
              <Route path="/books" element={<BooksPage onSelectBook={handleSelectBook} />} />
            </Routes>
          </main>
          <Footer />
        </RouteTransition>
        {selectedBook && <EPUBReader book={selectedBook} onClose={handleCloseReader} />}
      </div>
    </BrowserRouter>
  )
}

export default App
