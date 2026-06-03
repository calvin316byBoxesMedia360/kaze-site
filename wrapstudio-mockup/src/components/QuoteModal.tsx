/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Send, Paperclip, RefreshCw, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mockupImage: string;
  defaultService: 'vinil' | 'apparel';
}

export function QuoteModal({ isOpen, onClose, mockupImage, defaultService }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contactPref: 'WhatsApp',
    pieces: '',
    logoStatus: 'Sí, tengo archivo listo',
    idea: '',
    servicio: [defaultService === 'vinil' ? 'vinil' : 'apparel']
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCheckboxChange = (service: string) => {
    setFormData(prev => {
      const services = prev.servicio.includes(service)
        ? prev.servicio.filter(s => s !== service)
        : [...prev.servicio, service];
      return { ...prev, servicio: services };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      ...formData,
      mockupImage
    };

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccess(true);
      } else {
        throw new Error(result.error || 'Error al enviar');
      }
    } catch (err) {
      console.error(err);
      alert('Hubo un error al enviar tu cotización. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          background: '#09090b',
          border: '1px solid var(--border-glass)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '920px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-white)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles className="size-5" style={{ color: 'var(--accent)' }} /> Cotiza tu Diseño Personalizado
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Completa los detalles de tu proyecto y recibe una respuesta hoy mismo.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-muted)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            }}
          >
            <X className="size-4" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}>
          
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div 
                key="form-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}
              >
                {/* Left side: Attached Mockup Image */}
                <div style={{
                  flex: '1 1 340px',
                  padding: '24px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  borderRight: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Archivo de Diseño Adjunto
                  </span>
                  
                  <div style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    background: '#040406',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <img
                      src={mockupImage}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      alt="Mockup Adjunto"
                    />
                    
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      background: 'rgba(9, 9, 11, 0.8)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '10px',
                      color: 'var(--text-white)'
                    }}>
                      <Paperclip className="size-3 text-emerald-400" /> kaze-diseño.png
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(204, 255, 0, 0.03)',
                    border: '1px solid rgba(204, 255, 0, 0.1)',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '11px',
                    color: 'var(--text-body)',
                    lineHeight: '1.4'
                  }}>
                    💡 <strong>¡Listo para cotizar!</strong> Tu visualización se ha capturado y se adjuntará automáticamente a esta solicitud de presupuesto para que nuestro equipo técnico pueda evaluar el tamaño y distribución exactos.
                  </div>
                </div>

                {/* Right side: Form Fields */}
                <form onSubmit={handleSubmit} style={{
                  flex: '1 1 480px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px'
                }}>
                  {/* Step 1: Servicios */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      1. ¿Qué tipo de servicio requieres?
                    </span>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                      gap: '8px',
                      marginTop: '4px'
                    }}>
                      {[
                        { id: 'vinil', label: 'Stickers / Vinil' },
                        { id: 'apparel', label: 'Apparel / Ropa' },
                        { id: 'letreros', label: 'Letrero Luminoso' },
                        { id: 'bordado', label: 'Bordado' },
                        { id: 'serigrafia', label: 'Serigrafía' },
                        { id: 'otro', label: 'Otro' }
                      ].map(s => {
                        const isChecked = formData.servicio.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: isChecked ? '1px solid rgba(204, 255, 0, 0.3)' : '1px solid var(--border-glass)',
                              background: isChecked ? 'rgba(204, 255, 0, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                              cursor: 'pointer',
                              fontSize: '11px',
                              color: isChecked ? 'var(--text-white)' : 'var(--text-body)',
                              fontWeight: isChecked ? 'bold' : 'normal',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxChange(s.id)}
                              style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                            />
                            {s.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Detalles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      2. Detalles de tu proyecto
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>¿Qué tienes en mente? (Detalla tu idea)</span>
                      <textarea
                        name="idea"
                        value={formData.idea}
                        onChange={handleChange}
                        required
                        placeholder={defaultService === 'vinil' 
                          ? 'Ej: Quiero aplicar este diseño en las puertas laterales de mi camioneta Ford F-150. El material preferiblemente vinilo mate...'
                          : 'Ej: Necesito cotizar 50 camisetas con este diseño en el pecho y espalda para el equipo de mi empresa. Tallas de la S a la XL...'}
                        style={{
                          background: '#121216',
                          border: '1px solid var(--border-glass)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                          padding: '10px',
                          minHeight: '80px',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>¿Cuántas piezas requieres?</span>
                        <input
                          type="number"
                          name="pieces"
                          value={formData.pieces}
                          onChange={handleChange}
                          placeholder="Ej: 50"
                          style={{
                            background: '#121216',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                            padding: '8px 10px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>¿Tienes logo o archivo vectorial?</span>
                        <select
                          name="logoStatus"
                          value={formData.logoStatus}
                          onChange={handleChange}
                          style={{
                            background: '#121216',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                            padding: '8px 10px',
                            outline: 'none',
                            height: '34px'
                          }}
                        >
                          <option value="Sí, tengo archivo listo">Sí, tengo archivo listo</option>
                          <option value="No, necesito diseño">No, necesito que lo diseñen</option>
                          <option value="No sé todavía">No estoy seguro</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Contacto */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      3. Datos de contacto
                    </span>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nombre Completo</span>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Tu nombre"
                          style={{
                            background: '#121216',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                            padding: '8px 10px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email</span>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="correo@ejemplo.com"
                          style={{
                            background: '#121216',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                            padding: '8px 10px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Teléfono o WhatsApp</span>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Ej: 831-000-0000"
                          style={{
                            background: '#121216',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                            padding: '8px 10px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Preferencia de contacto</span>
                        <select
                          name="contactPref"
                          value={formData.contactPref}
                          onChange={handleChange}
                          style={{
                            background: '#121216',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                            padding: '8px 10px',
                            outline: 'none',
                            height: '34px'
                          }}
                        >
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Teléfono">Teléfono</option>
                          <option value="Email">Email</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-base btn-filled"
                    style={{
                      width: '100%',
                      height: '42px',
                      background: 'var(--accent)',
                      color: '#09090B',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '12px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px var(--accent-glow)',
                      marginTop: '10px'
                    }}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="size-4 animate-spin" /> Enviando solicitud...
                      </>
                    ) : (
                      <>
                        <Send className="size-4" /> Enviar Solicitud de Cotización
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '48px 24px',
                  width: '100%',
                  textAlign: 'center',
                  gap: '16px'
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <CheckCircle2 className="size-16 text-emerald-400" />
                </motion.div>
                
                <h4 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-white)', margin: 0 }}>
                  ¡Cotización enviada con éxito!
                </h4>
                
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '460px', margin: 0, lineHeight: '1.5' }}>
                  Hemos recibido tu diseño adjunto y los datos de tu proyecto. Nuestro equipo técnico evaluará tu solicitud y te responderá hoy mismo a través de tu medio preferido (<strong>{formData.contactPref}</strong>).
                </p>

                <button
                  onClick={() => {
                    setSuccess(false);
                    onClose();
                  }}
                  className="btn-base btn-filled"
                  style={{
                    padding: '10px 28px',
                    fontSize: '12px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-white)',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '16px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                >
                  Cerrar Ventana
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
