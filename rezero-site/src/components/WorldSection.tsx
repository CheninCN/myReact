import { useTranslation } from 'react-i18next'
import './WorldSection.css'

type LocationKey = 'lugnica' | 'sanctuary' | 'whaleWaters' | 'witchCult' | 'fortuna' | 'library'
type WitchKey = 'satella' | 'echidna' | 'typhon' | 'daphne' | 'sekhmet' | 'minerva' | 'carmilla'

const locationMeta: Array<{ key: LocationKey; icon: string; color: string }> = [
  { key: 'lugnica',    icon: '🏰', color: '#2563eb' },
  { key: 'sanctuary',  icon: '🌸', color: '#9333ea' },
  { key: 'whaleWaters',icon: '🌊', color: '#0891b2' },
  { key: 'witchCult',  icon: '🔮', color: '#c2410c' },
  { key: 'fortuna',    icon: '❄️', color: '#93c5fd' },
  { key: 'library',    icon: '📚', color: '#fbbf24' },
]

const witchMeta: Array<{ key: WitchKey; color: string }> = [
  { key: 'satella',  color: '#6b21a8' },
  { key: 'echidna',  color: '#d97706' },
  { key: 'typhon',   color: '#be123c' },
  { key: 'daphne',   color: '#15803d' },
  { key: 'sekhmet',  color: '#0369a1' },
  { key: 'minerva',  color: '#b45309' },
  { key: 'carmilla', color: '#be185d' },
]

export default function WorldSection() {
  const { t } = useTranslation()

  return (
    <section id="world" className="world">
      <div className="world__inner">
        <div className="world__header">
          <span className="world__label">{t('world.label')}</span>
          <h2 className="world__title">{t('world.title')}</h2>
          <p className="world__subtitle">{t('world.subtitle')}</p>
        </div>

        <div className="world__grid">
          {locationMeta.map((loc) => (
            <div
              key={loc.key}
              className="world__item"
              style={{ '--world-color': loc.color } as React.CSSProperties}
            >
              <span className="world__item-icon">{loc.icon}</span>
              <h3 className="world__item-title">{t(`world.locations.${loc.key}.title`)}</h3>
              <p className="world__item-desc">{t(`world.locations.${loc.key}.desc`)}</p>
            </div>
          ))}
        </div>

        <div className="world__witches">
          <div className="world__witches-header">
            <h3 className="world__witches-title">{t('world.witchesTitle')}</h3>
            <p className="world__witches-desc">{t('world.witchesDesc')}</p>
          </div>
          <div className="world__witches-list">
            {witchMeta.map((w) => (
              <div
                key={w.key}
                className="world__witch"
                style={{ '--witch-color': w.color } as React.CSSProperties}
              >
                <span className="world__witch-title">{t(`world.witches.${w.key}.title`)}</span>
                <span className="world__witch-name">{t(`world.witches.${w.key}.name`)}</span>
              </div>
            ))}
          </div>
        </div>

        <blockquote className="world__quote">
          <p>{t('world.quote')}</p>
          <footer>{t('world.quoteSource')}</footer>
        </blockquote>
      </div>
    </section>
  )
}
