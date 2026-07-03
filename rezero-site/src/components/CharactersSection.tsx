import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import './CharactersSection.css'

const BASE = '/characters'

const characterIds = [
  // エミリア陣営
  'subaru', 'emilia', 'puck', 'rem', 'ram', 'beatrice',
  'roswaal', 'frederica', 'petra', 'patrasche', 'otto', 'garfiel',
  // フェルト陣営
  'felt', 'reinhard',
  // クルシュ陣営
  'crusch', 'ferris', 'wilhelm',
  // アナスタシア陣営
  'anastasia', 'julius', 'joshua', 'mimi', 'hetaro', 'tivey', 'ricardo',
  // プリシラ陣営
  'priscilla', 'al',
  // 暗殺姉妹
  'elsa', 'meili',
  // 聖域
  'ryuzu',
  // 魔女教
  'petelgeuse', 'regulus', 'rye', 'sirius', 'capella', 'roy', 'rui',
  // その他
  'liliana', 'kiritaka', 'heinkel',
  // 監視塔
  'shaula', 'reid',
  // 魔女
  'echidna', 'minerva', 'daphne', 'typhon', 'sekhmet', 'carmilla', 'pandora',
] as const
type CharId = typeof characterIds[number]

type Group = 'emilia' | 'felt' | 'crusch' | 'anastasia' | 'priscilla' | 'assassin' | 'sanctuary' | 'witchcult' | 'other' | 'tower' | 'witch'

const characterMeta: Record<CharId, {
  portraitUrl: string
  fullUrl: string
  bustOnly?: boolean
  noImage?: boolean
  color: string
  colorLight: string
  gradient: string
  border: string
  group: Group
}> = {
  // エミリア陣営
  subaru:     { portraitUrl: `${BASE}/c/1c.webp`,  fullUrl: `${BASE}/f/1.webp`,   color: '#2563eb', colorLight: '#93c5fd', gradient: 'linear-gradient(135deg, #1a2f6e 0%, #0d1b3e 100%)', border: 'rgba(37,99,235,0.5)',   group: 'emilia' },
  emilia:     { portraitUrl: `${BASE}/c/2a.webp`,  fullUrl: `${BASE}/f/2.webp`,   color: '#93c5fd', colorLight: '#dce8ff', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0f2040 100%)', border: 'rgba(147,197,253,0.4)', group: 'emilia' },
  puck:       { portraitUrl: `${BASE}/c/3.png`,    fullUrl: `${BASE}/f/3.png`,    color: '#a78bfa', colorLight: '#ede9fe', gradient: 'linear-gradient(135deg, #2d1a4a 0%, #1a0f30 100%)', border: 'rgba(167,139,250,0.4)', group: 'emilia' },
  rem:        { portraitUrl: `${BASE}/c/4c.webp`,  fullUrl: `${BASE}/f/4.webp`,   color: '#3b82f6', colorLight: '#bfdbfe', gradient: 'linear-gradient(135deg, #1a3a5c 0%, #0d2040 100%)', border: 'rgba(59,130,246,0.5)',  group: 'emilia' },
  ram:        { portraitUrl: `${BASE}/c/5c.webp`,  fullUrl: `${BASE}/f/5.webp`,   color: '#f9a8d4', colorLight: '#fce7f3', gradient: 'linear-gradient(135deg, #3d1a2e 0%, #2a0f1e 100%)', border: 'rgba(249,168,212,0.4)', group: 'emilia' },
  beatrice:   { portraitUrl: `${BASE}/c/6a.webp`,  fullUrl: `${BASE}/f/6.webp`,   color: '#fbbf24', colorLight: '#fde68a', gradient: 'linear-gradient(135deg, #3d2e0a 0%, #281e05 100%)', border: 'rgba(251,191,36,0.4)',  group: 'emilia' },
  roswaal:    { portraitUrl: `${BASE}/c/7b.webp`,  fullUrl: `${BASE}/f/7.webp`,   color: '#c084fc', colorLight: '#f3e8ff', gradient: 'linear-gradient(135deg, #2d0f4a 0%, #1a0830 100%)', border: 'rgba(192,132,252,0.4)', group: 'emilia' },
  frederica:  { portraitUrl: `${BASE}/c/19.webp`,  fullUrl: `${BASE}/f/19.webp`,  color: '#6ee7b7', colorLight: '#d1fae5', gradient: 'linear-gradient(135deg, #0f3028 0%, #081f1a 100%)', border: 'rgba(110,231,183,0.4)', group: 'emilia' },
  petra:      { portraitUrl: `${BASE}/c/20.webp`,  fullUrl: `${BASE}/f/20.webp`,  color: '#fca5a5', colorLight: '#fee2e2', gradient: 'linear-gradient(135deg, #3d1010 0%, #2a0808 100%)', border: 'rgba(252,165,165,0.4)', group: 'emilia' },
  patrasche:  { portraitUrl: `${BASE}/c/34.png`,   fullUrl: `${BASE}/f/34.png`,   color: '#64748b', colorLight: '#cbd5e1', gradient: 'linear-gradient(135deg, #1e2a3a 0%, #0f1824 100%)', border: 'rgba(100,116,139,0.4)', group: 'emilia' },
  otto:       { portraitUrl: `${BASE}/c/21.webp`,  fullUrl: `${BASE}/f/21.webp`,  color: '#86efac', colorLight: '#dcfce7', gradient: 'linear-gradient(135deg, #0f2d18 0%, #071a0e 100%)', border: 'rgba(134,239,172,0.4)', group: 'emilia' },
  garfiel:    { portraitUrl: `${BASE}/c/23.webp`,  fullUrl: `${BASE}/f/23.webp`,  color: '#fdba74', colorLight: '#ffedd5', gradient: 'linear-gradient(135deg, #3d1f0a 0%, #2a1405 100%)', border: 'rgba(253,186,116,0.4)', group: 'emilia' },
  // フェルト陣営
  felt:       { portraitUrl: `${BASE}/c/8b.webp`,  fullUrl: `${BASE}/f/8.webp`,   color: '#4ade80', colorLight: '#bbf7d0', gradient: 'linear-gradient(135deg, #0f3020 0%, #082015 100%)', border: 'rgba(74,222,128,0.4)',  group: 'felt' },
  reinhard:   { portraitUrl: `${BASE}/c/9b.webp`,  fullUrl: `${BASE}/f/9.webp`,   color: '#fca5a5', colorLight: '#fee2e2', gradient: 'linear-gradient(135deg, #3d1010 0%, #2a0808 100%)', border: 'rgba(252,165,165,0.4)', group: 'felt' },
  // クルシュ陣営
  crusch:     { portraitUrl: `${BASE}/c/10b.webp`, fullUrl: `${BASE}/f/10.webp`,  color: '#bef264', colorLight: '#ecfccb', gradient: 'linear-gradient(135deg, #1a3010 0%, #0f2008 100%)', border: 'rgba(190,242,100,0.4)', group: 'crusch' },
  ferris:     { portraitUrl: `${BASE}/c/11c.webp`, fullUrl: `${BASE}/f/11.webp`,  color: '#f9a8d4', colorLight: '#fce7f3', gradient: 'linear-gradient(135deg, #3d102e 0%, #2a081e 100%)', border: 'rgba(249,168,212,0.4)', group: 'crusch' },
  wilhelm:    { portraitUrl: `${BASE}/c/12.webp`,  fullUrl: `${BASE}/f/12.webp`,  color: '#94a3b8', colorLight: '#e2e8f0', gradient: 'linear-gradient(135deg, #1e2a3a 0%, #0f1824 100%)', border: 'rgba(148,163,184,0.4)', group: 'crusch' },
  // アナスタシア陣営
  anastasia:  { portraitUrl: `${BASE}/c/13c.webp`, fullUrl: `${BASE}/f/13.webp`,  color: '#fb923c', colorLight: '#fed7aa', gradient: 'linear-gradient(135deg, #3d1a08 0%, #2a0f05 100%)', border: 'rgba(251,146,60,0.4)',  group: 'anastasia' },
  julius:     { portraitUrl: `${BASE}/c/14c.webp`, fullUrl: `${BASE}/f/14.webp`,  color: '#a78bfa', colorLight: '#ede9fe', gradient: 'linear-gradient(135deg, #2d1a4a 0%, #1a0f30 100%)', border: 'rgba(167,139,250,0.4)', group: 'anastasia' },
  joshua:     { portraitUrl: `${BASE}/c/37.webp`,  fullUrl: `${BASE}/f/37.webp`,  color: '#93c5fd', colorLight: '#dce8ff', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0f2040 100%)', border: 'rgba(147,197,253,0.4)', group: 'anastasia' },
  mimi:       { portraitUrl: `${BASE}/c/41.webp`,  fullUrl: `${BASE}/f/41.webp`,  color: '#fde68a', colorLight: '#fef9c3', gradient: 'linear-gradient(135deg, #3d2e0a 0%, #281e05 100%)', border: 'rgba(253,230,138,0.4)', group: 'anastasia' },
  hetaro:     { portraitUrl: `${BASE}/c/42.webp`,  fullUrl: `${BASE}/f/42.webp`,  color: '#86efac', colorLight: '#dcfce7', gradient: 'linear-gradient(135deg, #0f2d18 0%, #071a0e 100%)', border: 'rgba(134,239,172,0.4)', group: 'anastasia' },
  tivey:      { portraitUrl: `${BASE}/c/43.webp`,  fullUrl: `${BASE}/f/43.webp`,  color: '#7dd3fc', colorLight: '#e0f2fe', gradient: 'linear-gradient(135deg, #0c2a3d 0%, #071928 100%)', border: 'rgba(125,211,252,0.4)', group: 'anastasia' },
  ricardo:    { portraitUrl: `${BASE}/c/44.webp`,  fullUrl: `${BASE}/f/44.webp`,  color: '#d97706', colorLight: '#fde68a', gradient: 'linear-gradient(135deg, #3d2208 0%, #2a1605 100%)', border: 'rgba(217,119,6,0.4)',   group: 'anastasia' },
  // プリシラ陣営
  priscilla:  { portraitUrl: `${BASE}/c/15c.webp`, fullUrl: `${BASE}/f/15.webp`,  color: '#f87171', colorLight: '#fecaca', gradient: 'linear-gradient(135deg, #3d0f0f 0%, #2a0808 100%)', border: 'rgba(248,113,113,0.4)', group: 'priscilla' },
  al:         { portraitUrl: `${BASE}/c/16c.webp`, fullUrl: `${BASE}/f/16.webp`,  color: '#78716c', colorLight: '#d6d3d1', gradient: 'linear-gradient(135deg, #2a2010 0%, #1a1408 100%)', border: 'rgba(120,113,108,0.4)', group: 'priscilla' },
  // 暗殺姉妹
  elsa:       { portraitUrl: `${BASE}/c/17.webp`,  fullUrl: `${BASE}/f/17.webp`,  color: '#818cf8', colorLight: '#c7d2fe', gradient: 'linear-gradient(135deg, #0f0a28 0%, #08061a 100%)', border: 'rgba(129,140,248,0.4)', group: 'assassin' },
  meili:      { portraitUrl: `${BASE}/c/22b.webp`, fullUrl: `${BASE}/f/22.png`,   color: '#f472b6', colorLight: '#fce7f3', gradient: 'linear-gradient(135deg, #3d0f28 0%, #2a081a 100%)', border: 'rgba(244,114,182,0.4)', group: 'assassin' },
  // 聖域
  ryuzu:      { portraitUrl: `${BASE}/c/24.png`,   fullUrl: `${BASE}/f/24.png`,   color: '#fef08a', colorLight: '#fefce8', gradient: 'linear-gradient(135deg, #3d3608 0%, #282405 100%)', border: 'rgba(254,240,138,0.4)', group: 'sanctuary' },
  // 魔女教
  petelgeuse: { portraitUrl: `${BASE}/c/18.png`,   fullUrl: `${BASE}/f/18.png`,   color: '#6366f1', colorLight: '#c7d2fe', gradient: 'linear-gradient(135deg, #1e1b4b 0%, #12103a 100%)', border: 'rgba(99,102,241,0.4)',  group: 'witchcult' },
  regulus:    { portraitUrl: `${BASE}/c/32b.webp`, fullUrl: `${BASE}/f/32.webp`,  color: '#fbbf24', colorLight: '#fde68a', gradient: 'linear-gradient(135deg, #3d2e0a 0%, #281e05 100%)', border: 'rgba(251,191,36,0.4)',  group: 'witchcult' },
  rye:        { portraitUrl: `${BASE}/c/33b.webp`, fullUrl: `${BASE}/f/33.webp`,  color: '#f87171', colorLight: '#fecaca', gradient: 'linear-gradient(135deg, #3d0f0f 0%, #2a0808 100%)', border: 'rgba(248,113,113,0.4)', group: 'witchcult' },
  sirius:     { portraitUrl: `${BASE}/c/36.webp`,  fullUrl: `${BASE}/f/36.webp`,  color: '#fb923c', colorLight: '#fed7aa', gradient: 'linear-gradient(135deg, #3d1a08 0%, #2a0f05 100%)', border: 'rgba(251,146,60,0.4)',  group: 'witchcult' },
  capella:    { portraitUrl: `${BASE}/c/40b.webp`, fullUrl: `${BASE}/f/40.webp`,  color: '#f43f5e', colorLight: '#fecdd3', gradient: 'linear-gradient(135deg, #3d0818 0%, #2a0510 100%)', border: 'rgba(244,63,94,0.4)',   group: 'witchcult' },
  roy:        { portraitUrl: `${BASE}/c/48.webp`,  fullUrl: `${BASE}/f/48.webp`,  color: '#a3e635', colorLight: '#ecfccb', gradient: 'linear-gradient(135deg, #1a2e08 0%, #0f1e05 100%)', border: 'rgba(163,230,53,0.4)',  group: 'witchcult' },
  rui:        { portraitUrl: `${BASE}/c/47.webp`,  fullUrl: `${BASE}/f/47.webp`,  color: '#e2e8f0', colorLight: '#f8fafc', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1f 100%)', border: 'rgba(226,232,240,0.4)', group: 'witchcult' },
  // その他
  liliana:    { portraitUrl: `${BASE}/c/35b.webp`, fullUrl: `${BASE}/f/35.webp`,  color: '#e879f9', colorLight: '#fae8ff', gradient: 'linear-gradient(135deg, #3d0848 0%, #2a0530 100%)', border: 'rgba(232,121,249,0.4)', group: 'other' },
  kiritaka:   { portraitUrl: `${BASE}/c/38.webp`,  fullUrl: `${BASE}/f/38.webp`,  color: '#38bdf8', colorLight: '#e0f2fe', gradient: 'linear-gradient(135deg, #0c2a3d 0%, #071928 100%)', border: 'rgba(56,189,248,0.4)',  group: 'other' },
  heinkel:    { portraitUrl: `${BASE}/c/39.webp`,  fullUrl: `${BASE}/f/39.webp`,  color: '#94a3b8', colorLight: '#e2e8f0', gradient: 'linear-gradient(135deg, #1e2a3a 0%, #0f1824 100%)', border: 'rgba(148,163,184,0.4)', group: 'other' },
  // 監視塔（f/45,46 はサーバー側プレースホルダのため c/ を代用）
  shaula:     { portraitUrl: `${BASE}/c/45.webp`,  fullUrl: `${BASE}/c/45.webp`,  bustOnly: true, color: '#c084fc', colorLight: '#f3e8ff', gradient: 'linear-gradient(135deg, #2d0f4a 0%, #1a0830 100%)', border: 'rgba(192,132,252,0.4)', group: 'tower' },
  reid:       { portraitUrl: `${BASE}/c/46.webp`,  fullUrl: `${BASE}/c/46.webp`,  bustOnly: true, color: '#f87171', colorLight: '#fecaca', gradient: 'linear-gradient(135deg, #3d0f0f 0%, #2a0808 100%)', border: 'rgba(248,113,113,0.4)', group: 'tower' },
  // 魔女（.png）
  echidna:    { portraitUrl: `${BASE}/c/25.png`,   fullUrl: `${BASE}/f/25.png`,   color: '#e2e8f0', colorLight: '#f8fafc', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1f 100%)', border: 'rgba(226,232,240,0.4)', group: 'witch' },
  minerva:    { portraitUrl: `${BASE}/c/26.png`,   fullUrl: `${BASE}/f/26.png`,   color: '#fb923c', colorLight: '#fed7aa', gradient: 'linear-gradient(135deg, #3d1a08 0%, #2a0f05 100%)', border: 'rgba(251,146,60,0.4)',  group: 'witch' },
  daphne:     { portraitUrl: `${BASE}/c/27.png`,   fullUrl: `${BASE}/f/27.png`,   color: '#a78bfa', colorLight: '#ede9fe', gradient: 'linear-gradient(135deg, #2d1a4a 0%, #1a0f30 100%)', border: 'rgba(167,139,250,0.4)', group: 'witch' },
  typhon:     { portraitUrl: `${BASE}/c/28.png`,   fullUrl: `${BASE}/f/28.png`,   color: '#f9a8d4', colorLight: '#fce7f3', gradient: 'linear-gradient(135deg, #3d102e 0%, #2a081e 100%)', border: 'rgba(249,168,212,0.4)', group: 'witch' },
  sekhmet:    { portraitUrl: `${BASE}/c/29.png`,   fullUrl: `${BASE}/f/29.png`,   color: '#6ee7b7', colorLight: '#d1fae5', gradient: 'linear-gradient(135deg, #0f3028 0%, #081f1a 100%)', border: 'rgba(110,231,183,0.4)', group: 'witch' },
  carmilla:   { portraitUrl: `${BASE}/c/30.png`,   fullUrl: `${BASE}/f/30.png`,   color: '#f472b6', colorLight: '#fce7f3', gradient: 'linear-gradient(135deg, #3d0f28 0%, #2a081a 100%)', border: 'rgba(244,114,182,0.4)', group: 'witch' },
  pandora:    { portraitUrl: '', fullUrl: '', noImage: true,                       color: '#e9d5ff', colorLight: '#f5f3ff', gradient: 'linear-gradient(135deg, #2e1a47 0%, #1a0f2e 100%)', border: 'rgba(233,213,255,0.4)', group: 'witch' },
}

const groups: { key: Group; labelKey: string; ids: CharId[] }[] = [
  { key: 'emilia',    labelKey: 'characters.groupLabel.emilia',    ids: ['subaru','emilia','puck','rem','ram','beatrice','roswaal','frederica','petra','patrasche','otto','garfiel'] },
  { key: 'felt',      labelKey: 'characters.groupLabel.felt',      ids: ['felt','reinhard'] },
  { key: 'crusch',    labelKey: 'characters.groupLabel.crusch',    ids: ['crusch','ferris','wilhelm'] },
  { key: 'anastasia', labelKey: 'characters.groupLabel.anastasia', ids: ['anastasia','julius','joshua','mimi','hetaro','tivey','ricardo'] },
  { key: 'priscilla', labelKey: 'characters.groupLabel.priscilla', ids: ['priscilla','al'] },
  { key: 'assassin',  labelKey: 'characters.groupLabel.assassin',  ids: ['elsa','meili'] },
  { key: 'sanctuary', labelKey: 'characters.groupLabel.sanctuary', ids: ['ryuzu'] },
  { key: 'witchcult', labelKey: 'characters.groupLabel.witchcult', ids: ['petelgeuse','regulus','rye','sirius','capella','roy','rui'] },
  { key: 'other',     labelKey: 'characters.groupLabel.other',     ids: ['liliana','kiritaka','heinkel'] },
  { key: 'tower',     labelKey: 'characters.groupLabel.tower',     ids: ['shaula','reid'] },
  { key: 'witch',     labelKey: 'characters.groupLabel.witch',     ids: ['echidna','minerva','daphne','typhon','sekhmet','carmilla','pandora'] },
]

export default function CharactersSection() {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState<CharId>('subaru')
  const [imgError, setImgError] = useState<Record<string, boolean>>({})
  const cardRef = useRef<HTMLDivElement>(null)

  const meta = characterMeta[activeId]

  const handleImgError = (key: string) =>
    setImgError(prev => ({ ...prev, [key]: true }))

  const handleTabClick = (id: CharId) => {
    setActiveId(id)
    requestAnimationFrame(async () => {
      const card = cardRef.current
      if (!card) return
      const targetTop = card.getBoundingClientRect().top + window.scrollY - 80
      const overshoot = targetTop + 180

      document.documentElement.style.scrollBehavior = 'smooth'
      await window.scrollTo({ top: overshoot })
      await new Promise(resolve => setTimeout(resolve, 100))
      await window.scrollTo({ top: targetTop })
    })
  }

  const renderTab = (id: CharId) => (
    <button
      key={id}
      className={`chars__tab ${activeId === id ? 'chars__tab--active' : ''}`}
      style={{ '--char-color': characterMeta[id].color } as React.CSSProperties}
      onClick={() => handleTabClick(id)}
    >
      {!imgError[`thumb-${id}`] && !characterMeta[id].noImage ? (
        <img
          src={characterMeta[id].portraitUrl}
          alt={t(`characters.list.${id}.name`)}
          className="chars__tab-thumb"
          onError={() => handleImgError(`thumb-${id}`)}
        />
      ) : (
        <div className="chars__tab-thumb chars__tab-thumb--fallback" />
      )}
      <span className="chars__tab-name">{t(`characters.list.${id}.name`)}</span>
    </button>
  )

  return (
    <section id="characters" className="chars">
      <div className="chars__inner">
        <div className="chars__header">
          <span className="chars__label">{t('characters.label')}</span>
          <h2 className="chars__title">{t('characters.title')}</h2>
        </div>

        {groups.map(group => (
          <div key={group.key}>
            <div className={`chars__group-label ${group.key !== 'emilia' ? 'chars__group-label--secondary' : ''}`}>
              {t(group.labelKey)}
            </div>
            <div className={`chars__tabs chars__tabs--secondary ${group.key === 'witch' ? 'chars__tabs--witch' : ''}`}>
              {group.ids.map(renderTab)}
            </div>
          </div>
        ))}

        {/* Detail card */}
        <div
          ref={cardRef}
          className="chars__card"
          style={{
            background: meta.gradient,
            borderColor: meta.border,
            '--char-color': meta.color,
            '--char-color-light': meta.colorLight,
          } as React.CSSProperties}
        >
          {/* Portrait - 左侧圆形头像 */}
          <div className="chars__portrait">
            {!meta.noImage && !imgError[`portrait-${activeId}`] ? (
              <img
                src={meta.portraitUrl}
                alt={t(`characters.list.${activeId}.name`)}
                className="chars__portrait-img"
                onError={() => handleImgError(`portrait-${activeId}`)}
              />
            ) : (
              <div
                className="chars__portrait-fallback"
                style={{ borderColor: meta.border, boxShadow: `0 0 40px ${meta.color}30` }}
              />
            )}
            <div className="chars__portrait-glow" style={{ background: `radial-gradient(ellipse at bottom, ${meta.color}30, transparent 70%)` }} />
          </div>

          {/* Info - 右侧文字区域，全身图作为背景 */}
          <div className="chars__info">
            {/* 全身图背景层 */}
            {!meta.noImage && !imgError[`full-${activeId}`] && (
              <div 
                className="chars__info-bg"
                style={{
                  backgroundImage: `url(${meta.fullUrl})`,
                }}
              />
            )}
            <div className="chars__info-role">{t(`characters.list.${activeId}.role`)}</div>
            <h3 className="chars__info-name">{t(`characters.list.${activeId}.name`)}</h3>
            <p className="chars__info-name-en">{t(`characters.list.${activeId}.nameEn`)}</p>

            <div className="chars__info-meta-row">
              <div className="chars__info-ability">
                <span className="chars__info-ability-label">{t('characters.abilityLabel')}</span>
                <span className="chars__info-ability-value" style={{ color: meta.colorLight }}>
                  {t(`characters.list.${activeId}.ability`)}
                </span>
              </div>
              <div className="chars__info-cv">
                <span className="chars__info-cv-label">{t('characters.cvLabel')}</span>
                <span className="chars__info-cv-value" style={{ color: meta.colorLight }}>
                  {t(`characters.list.${activeId}.cv`)}
                </span>
              </div>
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