import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

const LANGUAGES = [
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

  const handleChange = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('rezero-lang', code)
    setOpen(false)
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={`lang-switcher ${open ? 'lang-switcher--open' : ''}`} ref={ref}>
      <button
        className="lang-switcher__trigger"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="lang-switcher__flag">{current.flag}</span>
        <span className="lang-switcher__label">{current.label}</span>
        <svg
          className="lang-switcher__chevron"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <ul className="lang-switcher__dropdown" role="listbox">
          {LANGUAGES.map((lang) => (
            <li
              key={lang.code}
              className={`lang-switcher__option ${lang.code === i18n.language ? 'lang-switcher__option--active' : ''}`}
              role="option"
              aria-selected={lang.code === i18n.language}
              onClick={() => handleChange(lang.code)}
            >
              <span className="lang-switcher__option-flag">{lang.flag}</span>
              <span className="lang-switcher__option-label">{lang.label}</span>
              {lang.code === i18n.language && (
                <svg className="lang-switcher__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 8l3.5 3.5L13 4" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
