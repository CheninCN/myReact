import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import LanguageSwitcher from './LanguageSwitcher'
import './Navigation.css'

export default function Navigation() {
  const { t } = useTranslation()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { path: '/',            id: 'home',       label: t('nav.home') },
    { path: '/characters',  id: 'characters', label: t('nav.characters') },
    { path: '/episodes',    id: 'episodes',   label: t('nav.episodes') },
    { path: '/world',       id: 'world',      label: t('nav.world') },
    { path: '/books',       id: 'books',      label: t('nav.books') },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path
  }

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <Link to="/" className="nav__logo" onClick={() => setMenuOpen(false)}>
          <span className="nav__logo-re">Re:</span>
          <span className="nav__logo-title">ゼロ</span>
          <span className="nav__logo-sub">から始まる異世界生活</span>
        </Link>

        <ul className={`nav__links ${menuOpen ? 'nav__links--open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav__link ${isActive(link.path) ? 'nav__link--active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="nav__lang-item">
            <LanguageSwitcher />
          </li>
        </ul>

        <div className="nav__right">
          <LanguageSwitcher />
          <button
            className={`nav__hamburger ${menuOpen ? 'nav__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t('nav.menuLabel')}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  )
}
