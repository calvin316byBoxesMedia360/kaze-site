'use client'

import Image from 'next/image'
import {
  BadgeCheck,
  ChevronRight,
  ClipboardList,
  Crosshair,
  Layers3,
  Menu,
  MonitorSmartphone,
  PenTool,
  Ruler,
  Scissors,
  Shirt,
  Sparkles,
} from 'lucide-react'
import './technical.css'

const navItems = [
  { href: '#system', label: 'System' },
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#visuals', label: 'Visuals' },
  { href: '#quote', label: 'Quote' },
]

const specs = [
  ['MODE', 'TECHNICAL EDITION'],
  ['OUTPUT', 'APPAREL + SIGNS'],
  ['SHOP', 'WATSONVILLE, CA'],
  ['STATUS', 'READY FOR REVIEW'],
]

const capabilities = [
  {
    icon: Shirt,
    title: 'Apparel System',
    text: 'Uniforms, merch and team gear built around clear artwork, color control and clean placement.',
  },
  {
    icon: Crosshair,
    title: 'Precision Graphics',
    text: 'Signs, DTF, decals and cuts presented with material-first specs and business-ready use cases.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Mobile Brightness',
    text: 'High-contrast panels, larger labels and brighter accents keep the shop story readable on phones.',
  },
  {
    icon: ClipboardList,
    title: 'Quote Workflow',
    text: 'A guided request path turns services into simple decisions: item, size, quantity and finish.',
  },
]

const visualCards = [
  {
    src: '/technical/shop-wide-1.png',
    title: 'Shop Floor',
    tag: 'LOCAL PRODUCTION',
    points: ['Intake', 'Proof', 'Produce'],
  },
  {
    src: '/technical/hero-apparel.png',
    title: 'Apparel Output',
    tag: 'BRAND READY',
    points: ['Garments', 'Color', 'Placement'],
  },
  {
    src: '/technical/shop-wide-2.png',
    title: 'Finishing Bay',
    tag: 'QUALITY CHECK',
    points: ['Trim', 'Inspect', 'Pack'],
  },
]

const verticalPanels = [
  {
    src: '/technical/machinery.png',
    label: 'THREAD DETAIL',
    title: 'Machine-led precision',
    text: 'Process photos become proof: density, alignment and repeatable production.',
  },
  {
    src: '/technical/dtf-sign.png',
    label: 'SIGN + DTF',
    title: 'Material clarity',
    text: 'Each visual can call out use, finish, durability and application context.',
  },
  {
    src: '/technical/engraving.png',
    label: 'CUSTOM FINISH',
    title: 'Detail storytelling',
    text: 'Short technical notes explain what the customer should notice first.',
  },
]

export default function TechnicalPage() {
  return (
    <main className="tech-page">
      <nav className="tech-nav" aria-label="Technical navigation">
        <a className="tech-brand" href="/">
          <Image src="/kaze-logo.jpg" alt="KAZE" width={40} height={40} />
          <span>
            <strong>KAZE</strong>
            <small>Technical Edition</small>
          </span>
        </a>
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
            <strong>COLOR SET</strong>
            <small>Brand-ready apparel palette</small>
          </div>
          <div className="callout callout-b">
            <span>02</span>
            <strong>OUTPUT CHECK</strong>
            <small>Print, stitch, sign, finish</small>
          </div>
        </div>
        <section className="tech-hero-copy">
          <p className="tech-eyebrow">Kaze Shop Performance</p>
          <h1>Custom apparel and signs, presented like a production system.</h1>
          <p>
            A brighter mobile-first concept for Kaze: technical labels, clean icons,
            real shop imagery and concise copy that explains the value behind every finish.
          </p>
          <div className="tech-actions">
            <a className="tech-button primary" href="#visuals">
              Review Visual System
              <ChevronRight size={18} />
            </a>
            <a className="tech-button ghost" href="/">
              Compare Version 1
            </a>
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

      <section className="tech-section" id="capabilities">
        <div className="tech-section-head">
          <p className="tech-eyebrow">Capability Map</p>
          <h2>Icon-led service blocks with short, technical promises.</h2>
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
          <p className="tech-eyebrow">Image Overlay Logic</p>
          <h2>Photos become explainers, not just decoration.</h2>
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
          <p className="tech-eyebrow">Admin / Editor Mode</p>
          <h2>Use this style as a parallel design direction.</h2>
          <p>
            This route keeps Version 1 intact while testing a brighter, more technical
            interface for mobile review, campaign images and future service pages.
          </p>
        </div>
        <div className="console-panel">
          <div><BadgeCheck size={18} /> Real Kaze imagery loaded</div>
          <div><Layers3 size={18} /> Overlay system established</div>
          <div><Ruler size={18} /> Mobile spacing increased</div>
          <div><Scissors size={18} /> Brand references removed</div>
          <div><PenTool size={18} /> Ready for copy edits</div>
          <div><Sparkles size={18} /> Bright accents tuned</div>
        </div>
      </section>
    </main>
  )
}
