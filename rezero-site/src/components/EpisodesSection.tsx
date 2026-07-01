import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './EpisodesSection.css'

type EpisodeKey =
  | 's1e01' | 's1e06' | 's1e13' | 's1e18' | 's1e25'
  | 's2e01' | 's2e13' | 's2e25'
  | 's3e01' | 's3e12'
  | 's4e01' | 's4e02' | 's4e03' | 's4e04' | 's4e05'
  | 's4e06' | 's4e07' | 's4e08' | 's4e09' | 's4e10' | 's4e11'

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
  { key: 's4e01', season: 'S4', num: 'EP 01', highlight: true },
  { key: 's4e02', season: 'S4', num: 'EP 02', highlight: false },
  { key: 's4e03', season: 'S4', num: 'EP 03', highlight: false },
  { key: 's4e04', season: 'S4', num: 'EP 04', highlight: false },
  { key: 's4e05', season: 'S4', num: 'EP 05', highlight: false },
  { key: 's4e06', season: 'S4', num: 'EP 06', highlight: false },
  { key: 's4e07', season: 'S4', num: 'EP 07', highlight: false },
  { key: 's4e08', season: 'S4', num: 'EP 08', highlight: false },
  { key: 's4e09', season: 'S4', num: 'EP 09', highlight: false },
  { key: 's4e10', season: 'S4', num: 'EP 10', highlight: false },
  { key: 's4e11', season: 'S4', num: 'EP 11', highlight: true },
]

const seasonMeta = [
  { id: 'S1', year: '2016', episodes: 25, color: '#2563eb' },
  { id: 'S2', year: '2020', episodes: 25, color: '#7c3aed' },
  { id: 'S3', year: '2024', episodes: 12, color: '#0891b2' },
  { id: 'S4', year: '2026', episodes: 11, color: '#d97706' },
]

export default function EpisodesSection() {
  const { t } = useTranslation()
  const [activeKey, setActiveKey] = useState<EpisodeKey | null>(null)

  const toggle = (key: EpisodeKey) =>
    setActiveKey((prev) => (prev === key ? null : key))

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
                  <h3 className="eps__season-title">
                    {t(`episodes.seasons.${s.id}.title`, { defaultValue: `Season ${s.id.slice(1)}` })}
                  </h3>
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
            {episodeMeta.map((ep) => {
              const isOpen = activeKey === ep.key
              const summary = t(`episodes.list.${ep.key}.summary`, { defaultValue: '' })
              const hasSummary = Boolean(summary)
              return (
                <div key={ep.key} className="eps__item-wrap">
                  <button
                    className={`eps__item ${ep.highlight ? 'eps__item--highlight' : ''} ${isOpen ? 'eps__item--open' : ''}`}
                    onClick={() => hasSummary && toggle(ep.key)}
                    aria-expanded={isOpen}
                    disabled={!hasSummary}
                  >
                    <span className="eps__item-season">{ep.season}</span>
                    <span className="eps__item-num">{ep.num}</span>
                    <span className="eps__item-title">{t(`episodes.list.${ep.key}.title`)}</span>
                    <span className="eps__item-note">{t(`episodes.list.${ep.key}.note`)}</span>
                    {hasSummary && (
                      <span className={`eps__item-chevron ${isOpen ? 'eps__item-chevron--open' : ''}`}>
                        ▸
                      </span>
                    )}
                  </button>
                  {isOpen && hasSummary && (
                    <div className="eps__summary">
                      <span className="eps__summary-label">{t('episodes.episodeSummaryLabel', { defaultValue: 'あらすじ' })}</span>
                      <p className="eps__summary-text">{summary}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
