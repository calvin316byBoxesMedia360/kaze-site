'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  BadgeCheck,
  ChevronRight,
  ClipboardList,
  Crosshair,
  HeartHandshake,
  MapPin,
  Layers3,
  Menu,
  MonitorSmartphone,
  PenTool,
  Ruler,
  Shirt,
  Sparkles,
  Store,
  UsersRound,
} from 'lucide-react'
import './technical.css'

const navItems = [
  { href: '#system', label: 'Studio' },
  { href: '#people', label: 'Who We Help' },
  { href: '#capabilities', label: 'Services' },
  { href: '#visuals', label: 'Details' },
  { href: '#quote', label: 'Quote' },
]

const specs = [
  ['SHOP', 'WATSONVILLE, CA'],
  ['HELP', 'IDEA TO FINISH'],
  ['WORK', 'APPAREL + SIGNS'],
  ['STYLE', 'TECH + HUMAN'],
]

const audiences = [
  {
    icon: Store,
    title: 'Local businesses',
    text: 'Storefront signs, uniforms, decals and promo pieces that help customers recognize you faster.',
  },
  {
    icon: UsersRound,
    title: 'Crews and teams',
    text: 'Workwear, staff apparel and group orders with placement, color and sizing guidance.',
  },
  {
    icon: Sparkles,
    title: 'Events and launches',
    text: 'Short-run pieces, banners and branded details made for pop-ups, markets and community moments.',
  },
]

const capabilities = [
  {
    icon: Shirt,
    title: 'Custom apparel',
    text: 'Shirts, hoodies, uniforms and merch with clean placement and a finish that fits the use.',
  },
  {
    icon: Crosshair,
    title: 'Signs and decals',
    text: 'Business graphics for windows, vehicles, events and storefronts, matched to the surface and purpose.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Design guidance',
    text: 'Bring the idea, logo or rough reference. Kaze helps with size, color, placement and quote details.',
  },
  {
    icon: ClipboardList,
    title: 'Clear quote path',
    text: 'Simple questions turn a custom request into a practical plan: item, quantity, material and deadline.',
  },
]

const visualCards = [
  {
    src: '/technical/shop-wide-1.png',
    title: 'The idea comes in',
    tag: 'LOCAL HELP',
    points: ['Listen', 'Measure', 'Plan'],
  },
  {
    src: '/technical/hero-apparel.png',
    title: 'The brand takes shape',
    tag: 'READY TO WEAR',
    points: ['Garment', 'Color', 'Placement'],
  },
  {
    src: '/technical/shop-wide-2.png',
    title: 'The details get checked',
    tag: 'SHOP FINISH',
    points: ['Inspect', 'Finish', 'Pickup'],
  },
]

const verticalPanels = [
  {
    src: '/technical/machinery.png',
    label: 'LOGO READY',
    title: 'Clean enough for daily use',
    text: 'Technical detail still matters, but the goal is simple: your logo should look right on real workwear.',
  },
  {
    src: '/technical/dtf-sign.png',
    label: 'MADE TO FIT',
    title: 'Materials chosen for the job',
    text: 'Signs, transfers and decals are easier to trust when the finish is explained in plain language.',
  },
  {
    src: '/technical/engraving.png',
    label: 'PERSONAL DETAIL',
    title: 'Custom work still feels personal',
    text: 'Small details, names, marks and finishes give the piece a human reason to exist.',
  },
]

export default function TechnicalPage() {
  return (
    <main className="tech-page">
      <nav className="tech-nav" aria-label="Technical navigation">
        <Link className="tech-brand" href="/">
          <Image src="/kaze-logo.jpg" alt="KAZE" width={40} height={40} />
          <span>
            <strong>KAZE</strong>
            <small>Shop Studio</small>
          </span>
        </Link>
        <div className="tech-nav-links">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
        <a className="tech-nav-cta" href="#quote">
          Start Quote
          <ChevronRight size={16} />
        </a>
        <button className="tech-menu" aria-label="Open navigation">
          <Menu size={22} />
        </button>
      </nav>

      <header className="tech-hero" id="system">
        <div className="tech-hero-media">
          <Image
            src="/technical/hero-apparel.png"
            alt="Kaze apparel production preview"
            fill
            priority
            sizes="100vw"
          />
          <div className="scanline" />
          <div className="callout callout-a">
            <span>01</span>
            <strong>LOCAL REVIEW</strong>
            <small>We help choose color, size and placement</small>
          </div>
          <div className="callout callout-b">
            <span>02</span>
            <strong>BRAND READY</strong>
            <small>Apparel, signs and details made to be used</small>
          </div>
        </div>
        <section className="tech-hero-copy">
          <p className="tech-eyebrow">Kaze Shop Studio</p>
          <h1>Your brand, made visible by a local shop that helps you shape the details.</h1>
          <p>
            A warmer Technical Edition for Kaze: real shop photos, helpful labels,
            clean icon modules and copy that speaks to businesses, crews, events and people.
          </p>
          <div className="tech-actions">
            <a className="tech-button primary" href="#visuals">
              See The Details
              <ChevronRight size={18} />
            </a>
            <Link className="tech-button ghost" href="/">
              Compare Version 1
            </Link>
          </div>
        </section>
        <aside className="spec-grid" aria-label="Project specs">
          {specs.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </aside>
      </header>

      <section className="human-section" id="people">
        <div className="human-copy">
          <p className="tech-eyebrow">Built Around People</p>
          <h2>Not every customer arrives with a perfect file or finished plan.</h2>
          <p>
            The hybrid direction keeps the technical confidence, but brings back the human
            part of Kaze: listening, guiding, adjusting and making the finished piece feel
            right for the person or business using it.
          </p>
        </div>
        <div className="audience-grid">
          {audiences.map((item) => {
            const Icon = item.icon
            return (
              <article className="audience-card" key={item.title}>
                <Icon size={28} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="tech-section" id="capabilities">
        <div className="tech-section-head">
          <p className="tech-eyebrow">Shop Capabilities</p>
          <h2>Technical where it helps. Plainspoken where customers need clarity.</h2>
        </div>
        <div className="capability-grid">
          {capabilities.map((item) => {
            const Icon = item.icon
            return (
              <article className="capability-card" key={item.title}>
                <Icon size={30} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="visual-system" id="visuals">
        <div className="tech-section-head">
          <p className="tech-eyebrow">Photo Notes</p>
          <h2>Overlays should explain care, use and context, not just sound technical.</h2>
        </div>
        <div className="wide-gallery">
          {visualCards.map((card, index) => (
            <article className="wide-card" key={card.src}>
              <Image src={card.src} alt={card.title} fill sizes="(max-width: 900px) 100vw, 33vw" />
              <div className="wide-card-content">
                <span>{String(index + 1).padStart(2, '0')} / {card.tag}</span>
                <h3>{card.title}</h3>
                <div>
                  {card.points.map((point) => (
                    <small key={point}>{point}</small>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="vertical-gallery">
          {verticalPanels.map((panel) => (
            <article className="vertical-panel" key={panel.src}>
              <div className="vertical-image">
                <Image src={panel.src} alt={panel.title} fill sizes="(max-width: 900px) 100vw, 33vw" />
                <span className="pin">{panel.label}</span>
              </div>
              <div>
                <h3>{panel.title}</h3>
                <p>{panel.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="quote-console" id="quote">
        <div>
          <p className="tech-eyebrow">Human Quote Flow</p>
          <h2>Bring the idea. Kaze helps turn it into something ready to use.</h2>
          <p>
            This version keeps the strong visual system, but shifts the message toward
            guidance, local trust and practical help from the first conversation.
          </p>
        </div>
        <div className="console-panel">
          <div><HeartHandshake size={18} /> Friendly guidance before production</div>
          <div><MapPin size={18} /> Watsonville shop, local customers</div>
          <div><BadgeCheck size={18} /> Real Kaze imagery stays central</div>
          <div><Layers3 size={18} /> Technical overlays with warmer copy</div>
          <div><Ruler size={18} /> Size and placement made easier</div>
          <div><PenTool size={18} /> Ready for the next design pass</div>
        </div>
      </section>
    </main>
  )
}
