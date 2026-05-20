import { t, type Lang } from '@/lib/i18n'

interface ApparelProps {
  lang: Lang
}

export default function Apparel({ lang }: ApparelProps) {
  const cards = [
    {
      img: '/technical/machinery.png',
      titleKey: 'app.t1.title',
      textKey: 'app.t1.text',
    },
    {
      img: '/placeholders/team-uniforms.svg',
      titleKey: 'app.t2.title',
      textKey: 'app.t2.text',
    },
    {
      img: '/placeholders/dtf-color.svg',
      titleKey: 'app.t3.title',
      textKey: 'app.t3.text',
    },
    {
      img: '/placeholders/vinyl-decals.svg',
      titleKey: 'app.t4.title',
      textKey: 'app.t4.text',
    },
  ]

  return (
    <section className="section paper" id="apparel">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t(lang, 'app.eyebrow')}</p>
            <h2>{t(lang, 'app.title')}</h2>
          </div>
          <p className="lead">{t(lang, 'app.lead')}</p>
        </div>
        <div className="service-grid">
          {cards.map((card, i) => (
            <article className="card" key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="card-img"
                src={card.img}
                alt=""
                loading="lazy"
                sizes="(max-width: 620px) 100vw, (max-width: 920px) 50vw, 25vw"
              />
              <div className="card-body">
                <h3>{t(lang, card.titleKey)}</h3>
                <p>{t(lang, card.textKey)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
