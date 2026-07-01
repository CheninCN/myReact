import { useTranslation } from 'react-i18next'
import './EpisodesSection.css'

type EpisodeKey = 's1e01' | 's1e06' | 's1e13' | 's1e18' | 's1e25' | 's2e01' | 's2e13' | 's2e25' | 's3e01' | 's3e12'

const episodeMeta: Array<{ key: EpisodeKey; season: string; num: string; highlight: boolean }> = [
  { key: 's1e01', season: 'S1', num: 'EP 01', highlight: true },
  { key: 's1e06', season: 'S1', num: 'EP 06', highlight: false },
  { key: 's1e13', season: 'S1', num: 'EP 13', highlight: false },
  { key: 's1e18', season: 'S1', num: 'EP 18', highlight: true },
  { key: 's1e25', season: 'S1', num: 'EP 25', highlight: false },
  { key: 's2e01', season: 'S2', num: 'EP 01', highlight: true },
  { key: 's2e13', season: 'S2', num: 'EP 13', highlight: false },
  { key: 's2e25', season: 'S2', num: 'EP 25', highlight: false },
  { key: 's3e01', season: 'S3', num: 'EP 01', highlight: true },
  { key: 's3e12', season: 'S3', num: 'EP 12', highlight: false },
]

const seasonMeta = [
  { id: 'S1', title: 'Season 1', year: '2016', episodes: 25, color: '#2563eb' },
  { id: 'S2', title: 'Season 2', year: '2020', episodes: 25, color: '#7c3aed' },
  { id: 'S3', title: 'Season 3', year: '2024', episodes: 12, color: '#0891b2' },
]

export default function EpisodesSection() {
  const { t } = useTranslation()

  return (
    <section id="episodes" className="eps">
      <div className="eps__inner">
        <div className="eps__header">
          <span className="eps__label">{t('episodes.label')}</span>
          <h2 className="eps__title">{t('episodes.title')}</h2>
          <p className="eps__subtitle">{t('episodes.subtitle')}</p>
        </div>

        <div className="eps__seasons">
          {seasonMeta.map((s) => (
            <div
              key={s.id}
              className="eps__season"
              style={{ '--season-color': s.color } as React.CSSProperties}
            >
              <div className="eps__season-header">
                <span className="eps__season-badge">{s.id}</span>
                <div>
                  <h3 className="eps__season-title">{s.title}</h3>
                  <span className="eps__season-year">
                    {s.year} • {s.episodes}{t('episodes.episodesUnit')}
                  </span>
                </div>
              </div>
              <p className="eps__season-desc">{t(`episodes.seasons.${s.id}.desc`)}</p>
            </div>
          ))}
        </div>

        <div className="eps__list-wrap">
          <h3 className="eps__list-title">{t('episodes.featuredTitle')}</h3>
          <div className="eps__list">
            {episodeMeta.map((ep) => (
              <div
                key={ep.key}
                className={`eps__item ${ep.highlight ? 'eps__item--highlight' : ''}`}
              >
                <span className="eps__item-season">{ep.season}</span>
                <span className="eps__item-num">{ep.num}</span>
                <span className="eps__item-title">{t(`episodes.list.${ep.key}.title`)}</span>
                <span className="eps__item-note">{t(`episodes.list.${ep.key}.note`)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
