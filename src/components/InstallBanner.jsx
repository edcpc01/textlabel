// src/components/InstallBanner.jsx
import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export function InstallBanner() {
  const [prompt, setPrompt]     = useState(null)   // beforeinstallprompt event
  const [visible, setVisible]   = useState(false)
  const [installed, setInstalled] = useState(false)
  const [isIOS, setIsIOS]       = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Já está instalado como PWA?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    // iOS Safari não dispara beforeinstallprompt — detecta manualmente
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)
    if (ios) {
      const dismissed = sessionStorage.getItem('pwa-ios-dismissed')
      if (!dismissed) setVisible(true)
      return
    }

    // Android / Chrome / Edge
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      const dismissed = sessionStorage.getItem('pwa-dismissed')
      if (!dismissed) setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setVisible(false)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function instalar() {
    if (isIOS) { setShowIOSGuide(true); return }
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
      setInstalled(true)
    }
  }

  function fechar() {
    setVisible(false)
    sessionStorage.setItem(isIOS ? 'pwa-ios-dismissed' : 'pwa-dismissed', '1')
  }

  if (installed || !visible) return null

  return (
    <>
      {/* BANNER */}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9998,
        background: 'var(--card2)',
        border: '1px solid var(--accent)',
        borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,.5), 0 0 0 1px rgba(0,212,255,.15)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
        minWidth: 320, maxWidth: 480,
        animation: 'slideUp .3s ease',
      }}>
        {/* Ícone */}
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'var(--accent)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'inherit', fontWeight: 700, fontSize: '1rem', color: '#000',
        }}>
          TL
        </div>

        {/* Texto */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--text)' }}>
            Instalar TextLabel
          </div>
          <div style={{ fontSize: '.73rem', color: 'var(--muted)', marginTop: 2 }}>
            {isIOS
              ? 'Adicione à tela de início para acesso rápido'
              : 'Instale o app para usar offline e com acesso rápido'
            }
          </div>
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={instalar}
            style={{
              background: 'var(--accent)', color: '#000',
              border: 'none', borderRadius: 6,
              padding: '8px 14px', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 700, fontSize: '.78rem',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Download size={14} />
            Instalar
          </button>
          <button
            onClick={fechar}
            style={{
              background: 'none', border: '1px solid var(--border2)',
              borderRadius: 6, padding: '8px', cursor: 'pointer',
              color: 'var(--muted)', display: 'flex', alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* GUIA iOS */}
      {showIOSGuide && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: 20,
        }} onClick={() => setShowIOSGuide(false)}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 16, padding: 28, maxWidth: 400, width: '100%',
            position: 'relative',
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowIOSGuide(false)} style={{
              position: 'absolute', top: 14, right: 14,
              background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer',
            }}><X size={16} /></button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Smartphone size={28} color="var(--accent)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                  Instalar no iPhone / iPad
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Siga os passos abaixo</div>
              </div>
            </div>

            {[
              { n: '1', icon: '⬆️', text: 'Toque no botão Compartilhar (ícone com seta para cima) na barra do Safari' },
              { n: '2', icon: '➕', text: 'Role para baixo e toque em "Adicionar à Tela de Início"' },
              { n: '3', icon: '✅', text: 'Toque em "Adicionar" no canto superior direito' },
            ].map(step => (
              <div key={step.n} style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                marginBottom: 16,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--accent)', color: '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '.78rem', flexShrink: 0,
                }}>
                  {step.n}
                </div>
                <div style={{ fontSize: '.84rem', color: 'var(--text2)', lineHeight: 1.5, paddingTop: 4 }}>
                  {step.icon} {step.text}
                </div>
              </div>
            ))}

            <button onClick={() => { setShowIOSGuide(false); setVisible(false); sessionStorage.setItem('pwa-ios-dismissed','1') }}
              style={{
                width: '100%', marginTop: 8,
                background: 'var(--accent)', color: '#000',
                border: 'none', borderRadius: 8, padding: '12px',
                fontFamily: 'inherit', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer',
              }}>
              Entendido!
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  )
}
