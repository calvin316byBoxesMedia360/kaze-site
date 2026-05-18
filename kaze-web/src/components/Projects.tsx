import { t, type Lang } from '@/lib/i18n'

interface ProjectsProps {
  lang: Lang
}

export default function Projects({ lang }: ProjectsProps) {
  return (
    <section className="section" id="trabajos">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t(lang, 'proj.eyebrow')}</p>
            <h2>{t(lang, 'proj.title')}</h2>
          </div>
          <p className="lead">{t(lang, 'proj.lead')}</p>
        </div>
        <div className="projects">
          <div
            className="project-main"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1400&q=80')" }}
          >
            <div>
              <p className="eyebrow" style={{ color: 'var(--green)' }}>{t(lang, 'proj.p1.eye')}</p>
              <h3>{t(lang, 'proj.p1.title')}</h3>
            </div>
          </div>
          <div className="project-stack">
            <div style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80')" }}>
              <div>
                <p className="eyebrow" style={{ color: 'var(--green)' }}>{t(lang, 'proj.p2.eye')}</p>
                <h3>{t(lang, 'proj.p2.title')}</h3>
              </div>
            </div>
            <div style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80')" }}>
              <div>
                <p className="eyebrow" style={{ color: 'var(--green)' }}>{t(lang, 'proj.p3.eye')}</p>
                <h3>{t(lang, 'proj.p3.title')}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
