import { t, type Lang } from '@/lib/i18n'

interface HistoryProps {
  lang: Lang
}

export default function History({ lang }: HistoryProps) {
  return (
    <section className="section paper">
      <div className="container split">
        <div
          className="photo"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80')" }}
        />
        <div>
          <p className="eyebrow">{t(lang, 'hist.eyebrow')}</p>
          <h2>{t(lang, 'hist.title')}</h2>
          <p className="lead" style={{ marginTop: '22px' }}>{t(lang, 'hist.lead')}</p>
          <div className="values">
            <div className="value">
              <h3>{t(lang, 'hist.v1.title')}</h3>
              <p>{t(lang, 'hist.v1.text')}</p>
            </div>
            <div className="value">
              <h3>{t(lang, 'hist.v2.title')}</h3>
              <p>{t(lang, 'hist.v2.text')}</p>
            </div>
            <div className="value">
              <h3>{t(lang, 'hist.v3.title')}</h3>
              <p>{t(lang, 'hist.v3.text')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
