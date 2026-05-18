import { t, type Lang } from '@/lib/i18n'

interface ContactPanelProps {
  lang: Lang
}

export default function ContactPanel({ lang }: ContactPanelProps) {
  return (
    <aside className="contact-panel">
      <p className="eyebrow">{t(lang, 'cp.eyebrow')}</p>
      <h3>{t(lang, 'cp.title')}</h3>
      <p>{t(lang, 'cp.lead')}</p>
      <div className="contact-line">
        <small>{t(lang, 'cp.l1')}</small>
        <strong>347 Main Street<br />Watsonville, CA</strong>
      </div>
      <div className="contact-line">
        <small>{t(lang, 'cp.l2')}</small>
        <strong>831-319-1837</strong>
      </div>
      <div className="contact-line">
        <small>{t(lang, 'cp.l3')}</small>
        <strong>@kaze_designs</strong>
      </div>
      <div className="contact-line">
        <small>{t(lang, 'cp.l4')}</small>
        <strong dangerouslySetInnerHTML={{ __html: t(lang, 'cp.hours') }} />
      </div>
      <div className="contact-ctas">
        <a href="tel:8313191837" className="cta-phone">{t(lang, 'cp.cta1')}</a>
        <a
          href="https://instagram.com/kaze_designs"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-ig"
        >
          {t(lang, 'cp.cta2')}
        </a>
      </div>
    </aside>
  )
}
