import { t, type Lang } from '@/lib/i18n'
import type { CSSProperties } from 'react'

interface SignsProps {
  lang: Lang
}

interface BadgeInfo {
  key: string
  className?: string
  style?: CSSProperties
}

interface CardInfo {
  img: string
  badge: BadgeInfo | null
  titleKey: string
  textKey: string
}

export default function Signs({ lang }: SignsProps) {
  const cards: CardInfo[] = [
    {
      img: '/placeholders/signs-led.svg',
      badge: { key: 'signs.b1', className: 'badge green' },
      titleKey: 'signs.c1.title',
      textKey: 'signs.c1.text',
    },
    {
      img: '/placeholders/storefront-local.svg',
      badge: { key: 'signs.b2', className: 'badge', style: { color: '#111', background: '#ffdf9f', border: 'none' } },
      titleKey: 'signs.c2.title',
      textKey: 'signs.c2.text',
    },
    {
      img: '/technical/shop-wide-2.png',
      badge: null,
      titleKey: 'signs.c3.title',
      textKey: 'signs.c3.text',
    },
    {
      img: '/technical/dtf-sign.png',
      badge: null,
      titleKey: 'signs.c4.title',
      textKey: 'signs.c4.text',
    },
  ]

  const industries = [
    'signs.i1','signs.i2','signs.i3','signs.i4',
    'signs.i5','signs.i6','signs.i7','signs.i8',
  ]

  return (
    <section className="section" id="letreros">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t(lang, 'signs.eyebrow')}</p>
            <h2>{t(lang, 'signs.title')}</h2>
          </div>
          <p className="lead">{t(lang, 'signs.lead')}</p>
        </div>
        <div className="catalog">
          {cards.map((card, i) => (
            <article className="card" key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="card-img"
                src={card.img}
                alt=""
                loading="lazy"
                sizes="(max-width: 620px) 100vw, (max-width: 920px) 50vw, 50vw"
              />
              <div className="card-body">
                {card.badge && (
                  <span
                    className={card.badge.className || 'badge'}
                    style={{ marginBottom: '12px', ...(card.badge.style || {}) }}
                  >
                    {t(lang, card.badge.key)}
                  </span>
                )}
                <h3>{t(lang, card.titleKey)}</h3>
                <p>{t(lang, card.textKey)}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="industry-grid">
          {industries.map(key => (
            <div className="chip" key={key}>{t(lang, key)}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
