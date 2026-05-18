import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kaze Designs — Letreros Luminosos y Apparel Personalizado en Watsonville, CA',
  description: 'Rótulos LED, bordado, serigrafía y uniformes a medida. Más de 10 años de experiencia. Cotiza gratis hoy — 831-319-1837.',
  keywords: 'letreros luminosos watsonville, neon signs watsonville ca, uniformes personalizados, bordado, serigrafía, kaze designs',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'KAZE Custom Apparel & Signs',
  alternateName: 'Kaze Designs',
  description: 'Fabricamos e instalamos letreros luminosos LED, neón y acrílico retroiluminado, además de ropa personalizada con bordado industrial, serigrafía y DTF en Watsonville, CA.',
  url: 'https://kazedesigns.com',
  telephone: '+18313191837',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '347 Main Street',
    addressLocality: 'Watsonville',
    addressRegion: 'CA',
    postalCode: '95076',
    addressCountry: 'US',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 36.9105, longitude: -121.7568 },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '10:00', closes: '15:00' },
  ],
  sameAs: ['https://www.instagram.com/kaze_designs'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servicios de personalización',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Letreros Luminosos LED y Neón' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bordado Industrial Personalizado' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Serigrafía y Heat Transfer' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Uniformes y Apparel Personalizado' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Stickers y Vinil' } },
    ],
  },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '87' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="light" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;700;800&family=Sora:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <div id="scrollProg" style={{ position:'fixed',top:0,left:0,height:'3px',zIndex:200,width:'0%', background:'linear-gradient(90deg,#e83e8c,#ff3b30,#0066ff,#00d084)', transition:'width .08s linear', pointerEvents:'none' }} />
        {children}
      </body>
    </html>
  )
}
