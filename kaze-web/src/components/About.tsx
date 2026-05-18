import { t, type Lang } from '@/lib/i18n'

interface AboutProps {
  lang: Lang
}

export default function About({ lang }: AboutProps) {
  return (
    <section className="section dark" id="about">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t(lang, 'about.eyebrow')}</p>
            <h2>{t(lang, 'about.title')}</h2>
          </div>
          <p className="lead" style={{ color: 'rgba(255,255,255,.72)' }}>{t(lang, 'about.lead')}</p>
        </div>
        <div className="stats">
          <div className="stat">
            <strong>+10</strong>
            <p>{t(lang, 'about.s1')}</p>
          </div>
          <div className="stat">
            <strong>~40</strong>
            <p>{t(lang, 'about.s2')}</p>
          </div>
          <div className="stat">
            <strong>6–10</strong>
            <p>{t(lang, 'about.s3')}</p>
          </div>
        </div>
        <div className="ceo-quote">
          <blockquote>{t(lang, 'about.quote')}</blockquote>
          <cite>{t(lang, 'about.cite')}</cite>
        </div>
      </div>
    </section>
  )
}
