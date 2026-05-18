import Image from 'next/image'
import { t, type Lang } from '@/lib/i18n'

interface FooterProps {
  lang: Lang
}

export default function Footer({ lang }: FooterProps) {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <Image
                className="footer-logo"
                src="/kaze-logo.jpg"
                alt="KAZE"
                width={36}
                height={36}
              />
              <span style={{ fontWeight: 900, fontSize: '14px' }}>KAZE Custom<br />Apparel &amp; Signs</span>
            </div>
            <p dangerouslySetInnerHTML={{ __html: t(lang, 'foot.addr') }} />
            <p className="footer-tagline">{t(lang, 'foot.tagline')}</p>
          </div>
          <div>
            <h4>{t(lang, 'foot.s1')}</h4>
            <p dangerouslySetInnerHTML={{ __html: t(lang, 'foot.s1.list') }} />
          </div>
          <div>
            <h4>{t(lang, 'foot.s2')}</h4>
            <p>
              347 Main Street<br />
              Watsonville, CA<br />
              <a href="tel:8313191837">831-319-1837</a><br />
              <a href="https://instagram.com/kaze_designs" target="_blank" rel="noopener noreferrer">@kaze_designs</a>
            </p>
          </div>
          <div>
            <h4>{t(lang, 'foot.s3')}</h4>
            <p>
              <a href="#inicio">{t(lang, 'foot.n1')}</a><br />
              <a href="#trabajos">{t(lang, 'foot.n2')}</a><br />
              <a href="#about">{t(lang, 'foot.n3')}</a><br />
              <a href="#cotizar">{t(lang, 'foot.n4')}</a>
            </p>
          </div>
        </div>
        <p className="copyright">{t(lang, 'foot.copy')}</p>
      </div>
    </footer>
  )
}
