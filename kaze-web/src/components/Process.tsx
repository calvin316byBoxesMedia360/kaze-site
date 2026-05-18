'use client'
import { useEffect, useRef } from 'react'
import { t, type Lang } from '@/lib/i18n'

interface ProcessProps {
  lang: Lang
}

export default function Process({ lang }: ProcessProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const steps = containerRef.current?.querySelectorAll('.step')
    if (!steps || !('IntersectionObserver' in window)) {
      steps?.forEach(s => s.classList.add('visible'))
      return
    }
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.2 }
    )
    steps.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  const steps = [
    { labelKey: 'proc.s1.label', titleKey: 'proc.s1.title', textKey: 'proc.s1.text' },
    { labelKey: 'proc.s2.label', titleKey: 'proc.s2.title', textKey: 'proc.s2.text' },
    { labelKey: 'proc.s3.label', titleKey: 'proc.s3.title', textKey: 'proc.s3.text' },
    { labelKey: 'proc.s4.label', titleKey: 'proc.s4.title', textKey: 'proc.s4.text' },
  ]

  return (
    <section className="section paper">
      <div className="container">
        <p className="eyebrow">{t(lang, 'proc.eyebrow')}</p>
        <h2>{t(lang, 'proc.title')}</h2>
        <p className="lead" style={{ marginTop: '16px' }}>{t(lang, 'proc.lead')}</p>
        <div className="process" ref={containerRef}>
          {steps.map((step, i) => (
            <div className="step" key={i}>
              <small>{t(lang, step.labelKey)}</small>
              <h3>{t(lang, step.titleKey)}</h3>
              <p>{t(lang, step.textKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
