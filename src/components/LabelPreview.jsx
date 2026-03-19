// src/components/LabelPreview.jsx
export function LabelPreview({ record }) {
  const {
    empresa    = '',
    cnpj       = '',
    composicao = '',
    descricao  = '',
    titulo     = '',
    maquina    = '—',
    ciclo      = 1,
    fuso       = 1,
    lote       = '—',
    data       = '',
  } = record || {}

  const cicloStr = String(ciclo).padStart(2, '0')
  const dataFmt  = data ? data.split('-').reverse().join('/') : '—'
  const compTit  = [composicao, titulo ? `${titulo}TEX` : ''].filter(Boolean).join(' - ') || '—'

  const cell = (label, value, flex = 1, big = false) => (
    <div style={{
      flex, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      borderRight: '1px solid #ddd', padding: '4px 2px',
    }}>
      <span style={{ fontSize: 8, color: '#888', textTransform: 'uppercase', letterSpacing: .5 }}>
        {label}
      </span>
      <span style={{ fontSize: big ? 30 : 18, fontWeight: 900, lineHeight: 1.1, marginTop: 1 }}>
        {value}
      </span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 20 }}>
      <div style={{
        width: 378, height: 226,
        background: '#fff', color: '#000',
        fontFamily: 'Arial, sans-serif',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 4px 24px rgba(0,0,0,.35)',
        overflow: 'hidden',
      }}>

        {/* L1 — Empresa */}
        <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, padding: '7px 8px 2px', lineHeight: 1.2 }}>
          {empresa || '— EMPRESA —'}
        </div>

        {/* L2 — CNPJ */}
        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, padding: '0 8px 2px', color: '#222' }}>
          {cnpj ? `CNPJ: ${cnpj}` : '—'}
        </div>

        {/* L3 — Descrição */}
        <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, padding: '0 8px 2px', lineHeight: 1.2 }}>
          {descricao || '—'}
        </div>

        {/* L4 — Composição + Título */}
        <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, padding: '0 8px 4px', color: '#333' }}>
          {compTit}
        </div>

        {/* DIVISOR */}
        <div style={{ borderTop: '2px solid #000' }} />

        {/* L5 — Máquina · Ciclo · Fuso */}
        <div style={{ display: 'flex', flex: 1, borderBottom: '2px solid #000' }}>
          {/* Máquina */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            borderRight: '1px solid #ccc',
          }}>
            <span style={{ fontSize: 8, color: '#888', textTransform: 'uppercase', letterSpacing: .5 }}>Máquina</span>
            <span style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{maquina}</span>
          </div>
          {/* Ciclo */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            borderRight: '1px solid #ccc',
          }}>
            <span style={{ fontSize: 8, color: '#888', textTransform: 'uppercase', letterSpacing: .5 }}>Ciclo</span>
            <span style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{cicloStr}</span>
          </div>
          {/* Fuso — destaque */}
          <div style={{
            flex: 1.2, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 8, color: '#888', textTransform: 'uppercase', letterSpacing: .5 }}>Fuso</span>
            <span style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{fuso}</span>
          </div>
        </div>

        {/* L6 — Lote + Data */}
        <div style={{ display: 'flex', minHeight: 34 }}>
          {/* Lote */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, borderRight: '1px solid #ddd', padding: '4px 8px',
          }}>
            <span style={{ fontSize: 11, color: '#555' }}>Lote</span>
            <span style={{ fontSize: 15, fontWeight: 900 }}>{lote}</span>
          </div>
          {/* Data */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, padding: '4px 8px',
          }}>
            <span style={{ fontSize: 11, color: '#555' }}>Data</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{dataFmt}</span>
          </div>
        </div>

      </div>

      <div style={{ fontSize: '.68rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.7 }}>
        Real: 50×30mm · Zebra ZT230 · 200dpi · ZPL II
      </div>
    </div>
  )
}
