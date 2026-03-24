// src/components/LabelPreview.jsx — Preview 2×3 (2 colunas, 3 linhas)
export function LabelPreview({ record }) {
  const {
    empresa = '', cnpj = '', composicao = '', descricao = '',
    titulo = '', maquina = '—', ciclo = 1, fuso = 1, lote = '—', data = '',
  } = record || {}

  const cicloStr = String(ciclo).padStart(2, '0')
  const dataFmt  = data ? data.split('-').reverse().join('/') : '—'
  const compTit  = [composicao, titulo ? `${titulo}TEX` : ''].filter(Boolean).join(' - ') || '—'

  const Cell = ({ fusoNum }) => (
    <div style={{
      width: 185, height: 110,
      background: '#fff', color: '#000',
      fontFamily: 'Arial, sans-serif',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', border: '1px solid #bbb',
      flexShrink: 0,
    }}>
      <div style={{ textAlign: 'center', fontSize: 8.5, fontWeight: 700, padding: '3px 2px 1px', lineHeight: 1.2 }}>
        {empresa || '— EMPRESA —'}
      </div>
      <div style={{ textAlign: 'center', fontSize: 7, padding: '0 2px 1px' }}>
        {cnpj ? `CNPJ: ${cnpj}` : '—'}
      </div>
      <div style={{ textAlign: 'center', fontSize: 7.5, fontWeight: 700, padding: '0 2px 1px', lineHeight: 1.2 }}>
        {descricao || '—'}
      </div>
      <div style={{ textAlign: 'center', fontSize: 6.5, padding: '0 2px 2px', color: '#333' }}>
        {compTit}
      </div>
      <div style={{ borderTop: '1.5px solid #000' }} />
      {/* Labels */}
      <div style={{ display: 'flex' }}>
        {['Maquina','Ciclo','Fuso'].map((l,i) => (
          <div key={i} style={{ flex: i===2?1.2:1, textAlign: 'center', fontSize: 5.5, color: '#888', padding: '1px 0',
            borderRight: i<2 ? '1px solid #ccc' : 'none' }}>{l}</div>
        ))}
      </div>
      {/* Valores */}
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center',
          borderRight:'1px solid #ccc', fontSize: 11, fontWeight: 900 }}>{maquina}</div>
        <div style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center',
          borderRight:'1px solid #ccc', fontSize: 11, fontWeight: 900 }}>{cicloStr}</div>
        <div style={{ flex: 1.2, display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: 18, fontWeight: 900 }}>{fusoNum}</div>
      </div>
      <div style={{ borderTop: '1.5px solid #000' }} />
      <div style={{ display: 'flex', padding: '2px 4px', alignItems: 'center' }}>
        <span style={{ fontSize: 6.5, marginRight: 3 }}>Lote</span>
        <span style={{ fontSize: 8, fontWeight: 900 }}>{lote}</span>
        <span style={{ marginLeft: 'auto', fontSize: 7, fontWeight: 700 }}>{dataFmt}</span>
      </div>
    </div>
  )

  // Mostra 2×3 = 6 etiquetas
  const fusos = [fuso, fuso+1, fuso+2, fuso+3, fuso+4, fuso+5]

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, padding:16 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:0, boxShadow:'0 4px 20px rgba(0,0,0,.3)', border:'1px solid #999' }}>
        {[0,1,2].map(row => (
          <div key={row} style={{ display:'flex', gap:0 }}>
            <Cell fusoNum={fusos[row*2]} />
            <Cell fusoNum={fusos[row*2+1]} />
          </div>
        ))}
      </div>
      <div style={{ fontSize:'.68rem', color:'var(--muted)', textAlign:'center', lineHeight:1.7 }}>
        2 colunas × 3 linhas = 6 etiquetas por bloco · 50×30mm cada · ZT230 · 200dpi
      </div>
    </div>
  )
}
