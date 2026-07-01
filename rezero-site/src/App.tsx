import Navigation from './components/Navigation'
import Hero from './components/Hero'
import StorySection from './components/StorySection'
import CharactersSection from './components/CharactersSection'
import EpisodesSection from './components/EpisodesSection'
import WorldSection from './components/WorldSection'
import Footer from './components/Footer'
import SnowParticles from './components/SnowParticles'
import './App.css'

function App() {
  return (
    <div className="app">
      <SnowParticles />
      <Navigation />
      <main>
        <Hero />
        <StorySection />
        <CharactersSection />
        <EpisodesSection />
        <WorldSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
