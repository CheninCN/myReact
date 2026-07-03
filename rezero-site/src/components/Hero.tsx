import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import './Hero.css'

export default function Hero() {
  const { t } = useTranslation()
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(40px)'
    setTimeout(() => {
      el.style.transition = 'opacity 1.2s ease, transform 1.2s ease'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, 300)
  }, [])

  return (
    <section id="top" className="hero">
      <div className="hero__bg">
        <div className="hero__bg-gradient" />
        <div className="hero__bg-witch-haze" />
        <div className="hero__bg-grid" />
      </div>

      <div className="hero__orbs">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
      </div>

      <div className="hero__content">
        <p className="hero__tagline">
          <span className="hero__tagline-line" />
          <span>{t('hero.tagline')}</span>
          <span className="hero__tagline-line" />
        </p>

        <div ref={titleRef} className="hero__title-wrap">
          <h1 className="hero__title">
            <span className="hero__title-re">Re:</span>
            <span className="hero__title-main">{t('hero.titleMain')}</span>
          </h1>
          <h2 className="hero__subtitle">{t('hero.titleSub')}</h2>
        </div>

        <p className="hero__romaji">{t('hero.romaji')}</p>

        <p className="hero__desc">
          {t('hero.desc1')}<br />
          {t('hero.desc2')}<span className="hero__desc-highlight">{t('hero.descHighlight')}</span>{t('hero.desc3')}<br />
          {t('hero.desc4')}
        </p>

        <div className="hero__actions">
          <Link to="/" className="hero__btn hero__btn--primary">
            <span>{t('hero.btnStory')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link to="/characters" className="hero__btn hero__btn--secondary">
            <span>{t('hero.btnChars')}</span>
          </Link>
        </div>

        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-num">3</span>
            <span className="hero__stat-label">{t('hero.statSeasons')}</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-num">30+</span>
            <span className="hero__stat-label">{t('hero.statVolumes')}</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-num">2016</span>
            <span className="hero__stat-label">{t('hero.statAired')}</span>
          </div>
        </div>
      </div>

      <div className="hero__scroll">
        <span>{t('hero.scroll')}</span>
        <div className="hero__scroll-bar" />
      </div>
    </section>
  )
}
