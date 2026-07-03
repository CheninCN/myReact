import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import './BlackHoleTransition.css'

export default function BlackHoleTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [phase, setPhase] = useState<'idle' | 'black' | 'white'>('idle')
  const [displayLocation, setDisplayLocation] = useState(location)
  const [showNewContent, setShowNewContent] = useState(false)

  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    if (e.animationName === 'eventHorizonExpand') {
      setShowNewContent(true)
      setPhase('white')
    } else if (e.animationName === 'whiteCoreContract') {
      setPhase('idle')
      setShowNewContent(false)
    }
  }, [])

  useEffect(() => {
    if (phase === 'idle') {
      setDisplayLocation(location)
    }
  }, [location, phase])

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname && phase === 'idle') {
      setPhase('black')
      setShowNewContent(false)
    }
  }, [location.pathname, displayLocation.pathname, phase])

  return (
    <>
      <div className={`bh-content ${phase !== 'idle' ? 'bh-content--hidden' : ''}`}>
        {children}
      </div>

      {phase !== 'idle' && (
        <div className="bh-overlay" onAnimationEnd={handleAnimationEnd}>
          {phase === 'black' && (
            <>
              <div className="bh-event-horizon" />
              <div className="bh-accretion-disk" />
              <div className="bh-lensing-ring bh-lensing-ring--1" />
              <div className="bh-lensing-ring bh-lensing-ring--2" />
              <div className="bh-particles">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="bh-particle"
                    style={{
                      '--angle': `${(360 / 16) * i}deg`,
                      '--distance': `${150 + (i % 2) * 60}px`,
                      '--delay': `${i * 0.03}s`,
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            </>
          )}
          {phase === 'white' && (
            <>
              <div className="bh-white-core" />
              <div className="bh-ejecta">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="bh-ejecta-particle"
                    style={{
                      '--angle': `${(360 / 16) * i}deg`,
                      '--distance': `${150 + (i % 2) * 60}px`,
                      '--delay': `${i * 0.03}s`,
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {showNewContent && (
        <div className="bh-new-content">
          {children}
        </div>
      )}
    </>
  )
}
