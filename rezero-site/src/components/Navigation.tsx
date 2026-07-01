import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import './Navigation.css'

export default function Navigation() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: '#story', label: t('nav.story') },
    { href: '#characters', label: t('nav.characters') },
    { href: '#episodes', label: t('nav.episodes') },
    { href: '#world', label: t('nav.world') },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <a href="#top" className="nav__logo">
          <span className="nav__logo-re">Re:</span>
          <span className="nav__logo-title">ゼロ</span>
          <span className="nav__logo-sub">から始まる異世界生活</span>
        </a>

        <ul className={`nav__links ${menuOpen ? 'nav__links--open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="nav__link"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#world" className="nav__cta" onClick={() => setMenuOpen(false)}>
              {t('nav.official')}
            </a>
          </li>
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
