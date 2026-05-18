'use client'
import { useState } from 'react'
import { t, type Lang } from '@/lib/i18n'

interface QuoteFormProps {
  lang: Lang
}

export default function QuoteForm({ lang }: QuoteFormProps) {
  const [checkedServices, setCheckedServices] = useState<string[]>([])
  const [progDone, setProgDone] = useState<boolean[]>([false, false, false])
  const [submitted, setSubmitted] = useState(false)

  const services = [
    { value: 'letreros', icon: '💡', key: 'form.o1' },
    { value: 'apparel', icon: '👕', key: 'form.o2' },
    { value: 'bordado', icon: '🪡', key: 'form.o3' },
    { value: 'serigrafia', icon: '🖨️', key: 'form.o4' },
    { value: 'vinil', icon: '✂️', key: 'form.o5' },
    { value: 'otro', icon: '✨', key: 'form.o6' },
  ]

  const toggleService = (val: string) => {
    setCheckedServices(prev => {
      const next = prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
      setProgDone(d => [next.length > 0, d[1], d[2]])
      return next
    })
  }

  const handleFieldChange = (fieldsetIdx: number) => {
    setProgDone(d => {
      const next = [...d]
      next[fieldsetIdx] = true
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <form onSubmit={handleSubmit}>
      {!submitted ? (
        <>
          {/* Progress indicator */}
          <div className="form-progress">
            <div className={`form-prog-step${checkedServices.length > 0 ? ' done' : ' active'}`}>
              <div className="prog-circle">1</div>
              <span className="prog-label">{t(lang, 'form.prog1')}</span>
            </div>
            <div className="prog-line" />
            <div className={`form-prog-step${progDone[1] ? ' done' : ''}`}>
              <div className="prog-circle">2</div>
              <span className="prog-label">{t(lang, 'form.prog2')}</span>
            </div>
            <div className="prog-line" />
            <div className={`form-prog-step${progDone[2] ? ' done' : ''}`}>
              <div className="prog-circle">3</div>
              <span className="prog-label">{t(lang, 'form.prog3')}</span>
            </div>
          </div>

          {/* Step 1 */}
          <fieldset>
            <legend>{t(lang, 'form.l1')}</legend>
            <div className="options">
              {services.map(svc => (
                <label
                  key={svc.value}
                  className={`option${checkedServices.includes(svc.value) ? ' checked' : ''}`}
                  onClick={() => toggleService(svc.value)}
                >
                  <input
                    type="checkbox"
                    name="servicio"
                    value={svc.value}
                    checked={checkedServices.includes(svc.value)}
                    onChange={() => toggleService(svc.value)}
                  />
                  <span className="opt-icon">{svc.icon}</span>
                  <span>{t(lang, svc.key)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Step 2 */}
          <fieldset>
            <legend>{t(lang, 'form.l2')}</legend>
            <div className="field">
              <span className="field-label">{t(lang, 'form.desc.label')}</span>
              <textarea
                placeholder={t(lang, 'form.desc.ph')}
                onChange={() => handleFieldChange(1)}
              />
            </div>
            <div className="form-grid" style={{ marginTop: '20px' }}>
              <div className="field">
                <span className="field-label">{t(lang, 'form.qty.label')}</span>
                <input
                  type="number"
                  placeholder={t(lang, 'form.qty.ph')}
                  onChange={() => handleFieldChange(1)}
                />
              </div>
              <div className="field">
                <span className="field-label">{t(lang, 'form.file.label')}</span>
                <select onChange={() => handleFieldChange(1)}>
                  <option value="">{t(lang, 'form.file.o0')}</option>
                  <option>{t(lang, 'form.file.o1')}</option>
                  <option>{t(lang, 'form.file.o2')}</option>
                  <option>{t(lang, 'form.file.o3')}</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Step 3 */}
          <fieldset>
            <legend>{t(lang, 'form.l3')}</legend>
            <div className="form-grid">
              <div className="field">
                <span className="field-label">{t(lang, 'form.name.label')}</span>
                <input
                  type="text"
                  placeholder={t(lang, 'form.name.ph')}
                  onChange={() => handleFieldChange(2)}
                />
              </div>
              <div className="field">
                <span className="field-label">{t(lang, 'form.phone.label')}</span>
                <input
                  type="tel"
                  placeholder="831-000-0000"
                  onChange={() => handleFieldChange(2)}
                />
              </div>
              <div className="field">
                <span className="field-label">{t(lang, 'form.email.label')}</span>
                <input
                  type="email"
                  placeholder={t(lang, 'form.email.ph')}
                  onChange={() => handleFieldChange(2)}
                />
              </div>
              <div className="field">
                <span className="field-label">{t(lang, 'form.contact.label')}</span>
                <select onChange={() => handleFieldChange(2)}>
                  <option>WhatsApp</option>
                  <option>{t(lang, 'form.contact.o2')}</option>
                  <option>Email</option>
                </select>
              </div>
            </div>
          </fieldset>

          <div className="form-submit">
            <button className="btn grad" type="submit" style={{ width: '100%' }}>
              {t(lang, 'form.submit')}
            </button>
            <p className="form-disclaimer">{t(lang, 'form.disc')}</p>
          </div>
        </>
      ) : (
        <div className="form-success visible">
          <div className="success-icon">✓</div>
          <p className="success-title">{t(lang, 'form.success.title')}</p>
          <p className="success-sub">{t(lang, 'form.success.sub')}</p>
          <a
            href="https://wa.me/8313191837"
            target="_blank"
            rel="noopener noreferrer"
            className="btn grad"
            style={{ marginTop: '8px' }}
          >
            {t(lang, 'form.success.wa')}
          </a>
        </div>
      )}
    </form>
  )
}
