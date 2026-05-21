'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { t, type Lang } from '@/lib/i18n'

interface NavbarProps {
  lang: Lang
  onLangChange: () => void
  theme: 'light' | 'dark'
  onThemeChange: () => void
}

const sunPath = 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z'
const moonPath = 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'

export default function Navbar({ lang, onLangChange, theme, onThemeChange }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
  }, [])

  useEffect(() => {
    const anchors = ['#servicios', '#about', '#letreros', '#apparel']
    const sections = anchors.map(a => document.querySelector(a)).filter(Boolean) as Element[]

    if (!('IntersectionObserver' in window)) return

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setActiveSection('#' + e.target.id)
        }
      })
    }, { rootMargin: '-40% 0px -55% 0px' })

    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const prog = document.getElementById('scrollProg')
    if (!prog) return
    const handler = () => {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      prog.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%'
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { href: '#servicios', key: 'nav.services' },
    { href: '#about', key: 'nav.about' },
    { href: '#letreros', key: 'nav.signs' },
    { href: '#apparel', key: 'nav.apparel' },
  ]

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <a className="brand" href="#inicio">
          <Image
            className="brand-logo"
            src="/kaze-logo.jpg"
            alt="KAZE"
            width={42}
            height={42}
          />
          <span className="brand-name">KAZE Custom<br />Apparel &amp; Signs</span>
        </a>

        <div className={`nav-links${menuOpen ? ' open' : ''}`} id="navLinks">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={activeSection === link.href ? 'active' : ''}
              onClick={closeMenu}
            >
              {t(lang, link.key)}
            </a>
          ))}
          <a className="btn primary" href="/studio/" onClick={closeMenu} style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
            {t(lang, 'nav.editor')}
          </a>
          <a className="btn primary" href="#cotizar" onClick={closeMenu}>
            {t(lang, 'nav.quote')}
          </a>
        </div>

        <div className="nav-controls">
          <button
            className="ctrl-btn lang-btn"
            onClick={onLangChange}
            aria-label="Switch language"
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
            </svg>
            <span>{lang === 'es' ? 'EN' : 'ES'}</span>
          </button>

          <button
            className="ctrl-btn"
            onClick={onThemeChange}
            aria-label="Toggle dark mode"
          >
            <svg viewBox="0 0 24 24">
              <path d={theme === 'dark' ? sunPath : moonPath} />
            </svg>
          </button>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
