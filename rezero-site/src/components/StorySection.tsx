import { useTranslation } from 'react-i18next'
import './StorySection.css'

const arcKeys = ['arc01', 'arc02', 'arc03', 'arc04'] as const
const arcColors = ['#2563eb', '#7c3aed', '#0891b2', '#9333ea']
const arcNumbers = ['01', '02', '03', '04']

export default function StorySection() {
  const { t } = useTranslation()

  return (
    <section id="story" className="story">
      <div className="story__inner">
        <div className="story__header">
          <span className="story__label">{t('story.label')}</span>
          <h2 className="story__title">{t('story.title')}</h2>
          <p className="story__intro">{t('story.intro')}</p>
        </div>

        <div className="story__power-card">
          <div className="story__power-icon">
            <svg viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="28" stroke="rgba(37,99,235,0.4)" strokeWidth="1.5" />
              <circle cx="30" cy="30" r="18" stroke="rgba(96,165,250,0.3)" strokeWidth="1" strokeDasharray="4 3" />
              <path d="M30 10 L33 26 L48 30 L33 34 L30 50 L27 34 L12 30 L27 26 Z" fill="rgba(37,99,235,0.5)" stroke="rgba(96,165,250,0.8)" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="story__power-text">
            <h3 className="story__power-title">{t('story.powerTitle')}</h3>
            <p className="story__power-desc">
              {t('story.powerDesc1')}<br />
              {t('story.powerDesc2')}<br />
              <span className="story__power-note">{t('story.powerNote')}</span>
            </p>
          </div>
        </div>

        <div className="story__arcs">
          {arcKeys.map((key, i) => (
            <div
              key={key}
              className="story__arc"
              style={{ '--arc-color': arcColors[i] } as React.CSSProperties}
            >
              <div className="story__arc-number">{arcNumbers[i]}</div>
              <div className="story__arc-content">
                <span className="story__arc-subtitle">{t(`story.arcs.${key}.subtitle`)}</span>
                <h3 className="story__arc-title">{t(`story.arcs.${key}.title`)}</h3>
                <p className="story__arc-desc">{t(`story.arcs.${key}.desc`)}</p>
              </div>
              <div className="story__arc-glow" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
