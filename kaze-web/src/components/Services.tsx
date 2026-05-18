import { t, type Lang } from '@/lib/i18n'

interface ServicesProps {
  lang: Lang
}

export default function Services({ lang }: ServicesProps) {
  const cards = [
    {
      img: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80',
      titleKey: 'svc.c1.title',
      textKey: 'svc.c1.text',
      linkKey: 'svc.c1.link',
      href: '#letreros',
    },
    {
      img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80',
      titleKey: 'svc.c2.title',
      textKey: 'svc.c2.text',
      linkKey: 'svc.c2.link',
      href: '#apparel',
    },
    {
      img: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?auto=format&fit=crop&w=900&q=80',
      titleKey: 'svc.c3.title',
      textKey: 'svc.c3.text',
      linkKey: 'svc.c3.link',
      href: '#apparel',
    },
    {
      img: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=900&q=80',
      titleKey: 'svc.c4.title',
      textKey: 'svc.c4.text',
      linkKey: 'svc.c4.link',
      href: '#cotizar',
    },
  ]

  return (
    <section className="section" id="servicios">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t(lang, 'svc.eyebrow')}</p>
            <h2>{t(lang, 'svc.title')}</h2>
          </div>
          <p className="lead">{t(lang, 'svc.lead')}</p>
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
                <a href={card.href}>{t(lang, card.linkKey)}</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
