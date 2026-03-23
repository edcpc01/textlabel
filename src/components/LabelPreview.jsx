// src/components/LabelPreview.jsx
// Preview 2 colunas lado a lado — escala 1.5×
export function LabelPreview({ record }) {
  const {
    empresa = '', cnpj = '', composicao = '', descricao = '',
    titulo = '', maquina = '—', ciclo = 1, fuso = 1, lote = '—', data = '',
  } = record || {}

  const cicloStr = String(ciclo).padStart(2, '0')
  const dataFmt  = data ? data.split('-').reverse().join('/') : '—'
  const compTit  = [composicao, titulo ? `${titulo}TEX` : ''].filter(Boolean).join(' - ') || '—'

  // Uma célula de etiqueta
  const Cell = ({ fusoNum }) => (
    <div style={{
      width: 189, height: 113,
      background: '#fff', color: '#000',
      fontFamily: 'Arial, sans-serif',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', border: '1px solid #ccc',
    }}>
      <div style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, padding: '4px 3px 1px', lineHeight: 1.2 }}>
        {empresa || '— EMPRESA —'}
      </div>
      <div style={{ textAlign: 'center', fontSize: 7.5, padding: '0 3px 1px' }}>
        {cnpj ? `CNPJ: ${cnpj}` : '—'}
      </div>
      <div style={{ textAlign: 'center', fontSize: 8, fontWeight: 700, padding: '0 3px 1px', lineHeight: 1.2 }}>
        {descricao || '—'}
      </div>
      <div style={{ textAlign: 'center', fontSize: 7, padding: '0 3px 2px', color: '#333' }}>
        {compTit}
      </div>
      <div style={{ borderTop: '1.5px solid #000' }} />
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #ccc' }}>
          <span style={{ fontSize: 5.5, color: '#888', textTransform: 'uppercase' }}>Máquina</span>
          <span style={{ fontSize: 11, fontWeight: 900 }}>{maquina}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #ccc' }}>
          <span style={{ fontSize: 5.5, color: '#888', textTransform: 'uppercase' }}>Ciclo</span>
          <span style={{ fontSize: 11, fontWeight: 900 }}>{cicloStr}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 5.5, color: '#888', textTransform: 'uppercase' }}>Fuso</span>
          <span style={{ fontSize: 18, fontWeight: 900 }}>{fusoNum}</span>
        </div>
      </div>
      <div style={{ borderTop: '1.5px solid #000' }} />
      <div style={{ display: 'flex', padding: '2px 4px', alignItems: 'center' }}>
        <span style={{ fontSize: 7, marginRight: 4 }}>Lote</span>
        <span style={{ fontSize: 9, fontWeight: 900 }}>{lote}</span>
        <span style={{ fontSize: 7, marginLeft: 'auto', marginRight: 4 }}>Data</span>
        <span style={{ fontSize: 8, fontWeight: 700 }}>{dataFmt}</span>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 16 }}>
      {/* 2 colunas × 1 linha de preview */}
      <div style={{ display: 'flex', gap: 0, boxShadow: '0 4px 20px rgba(0,0,0,.3)' }}>
        <Cell fusoNum={fuso} />
        <Cell fusoNum={fuso + 1} />
      </div>
      <div style={{ fontSize: '.68rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.7 }}>
        2 colunas × 50×30mm cada · Zebra ZT230 · 200dpi · ZPL II
      </div>
    </div>
  )
}
