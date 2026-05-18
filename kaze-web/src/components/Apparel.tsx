import { t, type Lang } from '@/lib/i18n'

interface ApparelProps {
  lang: Lang
}

export default function Apparel({ lang }: ApparelProps) {
  const cards = [
    {
      img: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=900&q=80',
      titleKey: 'app.t1.title',
      textKey: 'app.t1.text',
    },
    {
      img: 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?auto=format&fit=crop&w=900&q=80',
      titleKey: 'app.t2.title',
      textKey: 'app.t2.text',
    },
    {
      img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80',
      titleKey: 'app.t3.title',
      textKey: 'app.t3.text',
    },
    {
      img: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=900&q=80',
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
