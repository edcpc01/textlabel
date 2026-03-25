// src/components/LabelPreview.jsx — Preview 2×3 com layout configurável
export function LabelPreview({ record, layout = {} }) {
  const {
    empresa = '', cnpj = '', composicao = '', descricao = '',
    titulo = '', maquina = '—', ciclo = 1, fuso = 1, lote = '—', data = '',
  } = record || {}

  const {
    colMaq   = 135,
    colCiclo = 95,
    margemX  = 6,
    fontFuso = '36,34',
    fontMaq  = '24,22',
    fontCiclo= '24,22',
  } = layout

  const cicloStr = String(ciclo).padStart(2, '0')
  const dataFmt  = data ? data.split('-').reverse().join('/') : '—'
  const compTit  = [composicao, titulo ? `${titulo}TEX` : ''].filter(Boolean).join(' - ') || '—'

  // Escala: etiqueta real 393×236 dots → preview 189×113px (escala 0.482)
  // Preview menor para caber 2 colunas lado a lado
  const W_real  = 393
  const H_real  = 236
  const scale   = 0.48
  const W = Math.round(W_real * scale)  // ~189px
  const H = Math.round(H_real * scale)  // ~113px

  const scaleV  = (v) => Math.round(v * scale)

  // Proporção das colunas (mesma do ZPL)
  const totalW  = W_real - margemX * 2
  const colF    = totalW - colMaq - colCiclo
  const pMaq    = colMaq   / totalW
  const pCiclo  = colCiclo / totalW
  const pFuso   = colF     / totalW

  const fFusoH  = parseInt(fontFuso.split(',')[0]) * scale
  const fMaqH   = parseInt(fontMaq.split(',')[0])  * scale
  const fCicloH = parseInt(fontCiclo.split(',')[0])* scale

  const Cell = ({ fusoNum }) => (
    <div style={{
      width: W, height: H, background: '#fff', color: '#000',
      fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', border: '1px solid #bbb', flexShrink: 0,
      padding: `${scaleV(4)}px ${scaleV(margemX)}px`,
      boxSizing: 'border-box',
    }}>
      <div style={{ textAlign: 'center', fontSize: scaleV(9), fontWeight: 700, lineHeight: 1.2 }}>
        {empresa || '— EMPRESA —'}
      </div>
      <div style={{ textAlign: 'center', fontSize: scaleV(7.5) }}>
        {cnpj ? `CNPJ: ${cnpj}` : '—'}
      </div>
      <div style={{ textAlign: 'center', fontSize: scaleV(8), fontWeight: 700, lineHeight: 1.2 }}>
        {descricao || '—'}
      </div>
      <div style={{ textAlign: 'center', fontSize: scaleV(7), color: '#444' }}>
        {compTit}
      </div>
      <div style={{ borderTop: '1.5px solid #000', margin: `${scaleV(2)}px 0` }} />
      <div style={{ display: 'flex', fontSize: scaleV(5.5), color: '#888' }}>
        <div style={{ width: `${pMaq*100}%`, textAlign: 'center' }}>Maquina</div>
        <div style={{ width: `${pCiclo*100}%`, textAlign: 'center' }}>Ciclo</div>
        <div style={{ width: `${pFuso*100}%`, textAlign: 'center' }}>Fuso</div>
      </div>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
        <div style={{ width: `${pMaq*100}%`, textAlign: 'center', fontSize: fMaqH, fontWeight: 900 }}>{maquina}</div>
        <div style={{ width: `${pCiclo*100}%`, textAlign: 'center', fontSize: fCicloH, fontWeight: 900 }}>{cicloStr}</div>
        <div style={{ width: `${pFuso*100}%`, textAlign: 'center', fontSize: fFusoH, fontWeight: 900 }}>{fusoNum}</div>
      </div>
      <div style={{ borderTop: '1.5px solid #000', margin: `${scaleV(2)}px 0` }} />
      <div style={{ display: 'flex', fontSize: scaleV(7) }}>
        <div style={{ flex: 1, textAlign: 'center' }}>Lote <strong>{lote}</strong></div>
        <div style={{ flex: 1, textAlign: 'center' }}><strong>{dataFmt}</strong></div>
      </div>
    </div>
  )

  const fusos = [fuso, fuso+1, fuso+2, fuso+3, fuso+4, fuso+5]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20, minHeight: 400 }}>
      <div style={{ border: '1px solid #666', boxShadow: '0 4px 16px rgba(0,0,0,.3)' }}>
        {[0,1,2].map(row => (
          <div key={row} style={{ display: 'flex' }}>
            <Cell fusoNum={fusos[row*2]} />
            <Cell fusoNum={fusos[row*2+1]} />
          </div>
        ))}
      </div>
      <div style={{ fontSize: '.65rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.7 }}>
        2 colunas × 3 linhas = 6 etiquetas · 50×30mm cada · ZT230 · 200dpi
      </div>
    </div>
  )
}
