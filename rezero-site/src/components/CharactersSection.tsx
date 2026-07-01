import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './CharactersSection.css'

const characterIds = ['subaru', 'emilia', 'rem', 'ram', 'beatrice', 'felt'] as const
type CharId = typeof characterIds[number]

const characterMeta: Record<CharId, {
  nameEn: string
  symbol: string
  color: string
  colorLight: string
  gradient: string
  border: string
}> = {
  subaru:   { nameEn: 'Natsuki Subaru', symbol: '⚡', color: '#2563eb', colorLight: '#60a5fa', gradient: 'linear-gradient(135deg, #1a2f6e 0%, #0d1b3e 100%)', border: 'rgba(37, 99, 235, 0.5)' },
  emilia:   { nameEn: 'Emilia',         symbol: '❄',  color: '#93c5fd', colorLight: '#dce8ff', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0f2040 100%)', border: 'rgba(147, 197, 253, 0.4)' },
  rem:      { nameEn: 'Rem',            symbol: '💧', color: '#3b82f6', colorLight: '#93c5fd', gradient: 'linear-gradient(135deg, #1a3a5c 0%, #0d2040 100%)', border: 'rgba(59, 130, 246, 0.5)' },
  ram:      { nameEn: 'Ram',            symbol: '🌸', color: '#f9a8d4', colorLight: '#fce7f3', gradient: 'linear-gradient(135deg, #3d1a2e 0%, #2a0f1e 100%)', border: 'rgba(249, 168, 212, 0.4)' },
  beatrice: { nameEn: 'Beatrice',       symbol: '✨', color: '#fbbf24', colorLight: '#fde68a', gradient: 'linear-gradient(135deg, #3d2e0a 0%, #281e05 100%)', border: 'rgba(251, 191, 36, 0.4)' },
  felt:     { nameEn: 'Felt',           symbol: '💎', color: '#4ade80', colorLight: '#bbf7d0', gradient: 'linear-gradient(135deg, #0f3020 0%, #082015 100%)', border: 'rgba(74, 222, 128, 0.4)' },
}

export default function CharactersSection() {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState<CharId>('subaru')

  const meta = characterMeta[activeId]

  return (
    <section id="characters" className="chars">
      <div className="chars__inner">
        <div className="chars__header">
          <span className="chars__label">{t('characters.label')}</span>
          <h2 className="chars__title">{t('characters.title')}</h2>
        </div>

        <div className="chars__tabs">
          {characterIds.map((id) => (
            <button
              key={id}
              className={`chars__tab ${activeId === id ? 'chars__tab--active' : ''}`}
              style={{ '--char-color': characterMeta[id].color } as React.CSSProperties}
              onClick={() => setActiveId(id)}
            >
              <span className="chars__tab-symbol">{characterMeta[id].symbol}</span>
              <span className="chars__tab-name">{t(`characters.list.${id}.name`)}</span>
            </button>
          ))}
        </div>

        <div
          key={activeId}
          className="chars__card"
          style={{
            background: meta.gradient,
            borderColor: meta.border,
            '--char-color': meta.color,
            '--char-color-light': meta.colorLight,
          } as React.CSSProperties}
        >
          <div className="chars__avatar">
            <div
              className="chars__avatar-circle"
              style={{ borderColor: meta.border, boxShadow: `0 0 40px ${meta.color}30` }}
            >
              <span className="chars__avatar-symbol">{meta.symbol}</span>
            </div>
            <div className="chars__avatar-rings">
              <div className="chars__avatar-ring chars__avatar-ring--1" style={{ borderColor: meta.border }} />
              <div className="chars__avatar-ring chars__avatar-ring--2" style={{ borderColor: meta.colorLight }} />
            </div>
          </div>

          <div className="chars__info">
            <div className="chars__info-role">{t(`characters.list.${activeId}.role`)}</div>
            <h3 className="chars__info-name">{t(`characters.list.${activeId}.name`)}</h3>
            <p className="chars__info-name-en">{meta.nameEn}</p>

            <div className="chars__info-ability">
              <span className="chars__info-ability-label">{t('characters.abilityLabel')}</span>
              <span className="chars__info-ability-value" style={{ color: meta.colorLight }}>
                {t(`characters.list.${activeId}.ability`)}
              </span>
            </div>

            <p className="chars__info-desc">{t(`characters.list.${activeId}.desc`)}</p>

            <div className="chars__info-traits">
              {(t(`characters.list.${activeId}.traits`, { returnObjects: true }) as string[]).map((trait) => (
                <span
                  key={trait}
                  className="chars__trait"
                  style={{ borderColor: meta.border, color: meta.colorLight }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          <div className="chars__card-glow" style={{ background: `radial-gradient(ellipse at top right, ${meta.color}18, transparent 60%)` }} />
        </div>
      </div>
    </section>
  )
}
