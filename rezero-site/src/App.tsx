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
import './App.css'

function App() {
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
            </Routes>
          </main>
          <Footer />
        </RouteTransition>
      </div>
    </BrowserRouter>
  )
}

export default App
