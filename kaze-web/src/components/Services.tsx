import { t, type Lang } from '@/lib/i18n'

interface ServicesProps {
  lang: Lang
}

export default function Services({ lang }: ServicesProps) {
  const cards = [
    {
      img: '/placeholders/signs-led.svg',
      titleKey: 'svc.c1.title',
      textKey: 'svc.c1.text',
      linkKey: 'svc.c1.link',
      href: '#letreros',
    },
    {
      img: '/placeholders/apparel-rack.svg',
      titleKey: 'svc.c2.title',
      textKey: 'svc.c2.text',
      linkKey: 'svc.c2.link',
      href: '#apparel',
    },
    {
      img: '/placeholders/embroidery-detail.svg',
      titleKey: 'svc.c3.title',
      textKey: 'svc.c3.text',
      linkKey: 'svc.c3.link',
      href: '#apparel',
    },
    {
      img: '/placeholders/vinyl-decals.svg',
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
