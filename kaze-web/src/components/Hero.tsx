'use client'
import { t, type Lang } from '@/lib/i18n'

interface HeroProps {
  lang: Lang
}

export default function Hero({ lang }: HeroProps) {
  return (
    <header className="hero" id="inicio">
      <div className="hero-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-photo" src="/technical/shop-wide-1.png" alt="" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grain" />
      </div>
      <div className="container hero-copy">
        <p className="eyebrow">{t(lang, 'hero.eyebrow')}</p>
        <h1 dangerouslySetInnerHTML={{ __html: t(lang, 'hero.h1') }} />
        <p className="lead">{t(lang, 'hero.lead')}</p>
        <div className="hero-actions">
          <a className="btn grad" href="#cotizar">{t(lang, 'hero.cta1')}</a>
          <a className="btn outline" href="#trabajos">{t(lang, 'hero.cta2')}</a>
        </div>
        <div className="trust-row">
          <span className="badge green">{t(lang, 'hero.badge1')}</span>
          <span className="badge">{t(lang, 'hero.badge2')}</span>
          <span className="badge">{t(lang, 'hero.badge3')}</span>
          <span className="badge">831-319-1837</span>
        </div>
      </div>
    </header>
  )
}
