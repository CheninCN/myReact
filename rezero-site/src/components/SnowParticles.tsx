import { useEffect, useRef } from 'react'
import './SnowParticles.css'

export default function SnowParticles() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const particles: HTMLDivElement[] = []

    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div')
      p.className = 'snow-particle'
      const size = Math.random() * 4 + 1
      const delay = Math.random() * 10
      const duration = Math.random() * 12 + 8
      const left = Math.random() * 100

      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        opacity: ${Math.random() * 0.5 + 0.1};
      `
      container.appendChild(p)
      particles.push(p)
    }

    return () => {
      particles.forEach((p) => p.remove())
    }
  }, [])

  return <div ref={containerRef} className="snow-container" />
}
