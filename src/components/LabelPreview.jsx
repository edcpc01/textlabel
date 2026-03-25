// src/components/LabelPreview.jsx
// Preview fiel à etiqueta física — sem linhas, proporcional ao ZPL

import { LAYOUT_DEFAULT } from '../lib/zpl'

function CelulaEtiqueta({ record, fusoNum, layout = {} }) {
  const L = { ...LAYOUT_DEFAULT, ...layout }

  const {
    empresa = '', cnpj = '', composicao = '', descricao = '',
    titulo = '', maquina = '—', ciclo = 1, lote = '—', data = '',
  } = record || {}

  const cicloStr = String(ciclo).padStart(2, '0')
  const dataFmt  = data ? data.split('-').reverse().join('/') : '—'
  const compTit  = [composicao, titulo ? `${titulo}TEX` : ''].filter(Boolean).join(' - ') || '—'

  // Escala: etiqueta real = 393×236 dots → preview = 185×111px (fator ~0.47)
  const SC = 0.47
  const pf = (s) => {
    const [h] = String(s).split(',').map(Number)
    return Math.max(6, Math.round(h * SC * 0.72)) // converte dots → px aproximado
  }

  const mX   = Number(L.margemX) || 14
  const colMaq   = Number(L.colMaq)   || 135
  const colCiclo = Number(L.colCiclo) || 95
  const W    = 393 - mX * 2
  const pMaq   = colMaq   / W
  const pCiclo = colCiclo / W
  const pFuso  = 1 - pMaq - pCiclo

  return (
    <div style={{
      width: 185, height: 111,
      background: '#fff', color: '#000',
      fontFamily: 'Arial, Helvetica, sans-serif',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', border: '1px solid #ccc',
      flexShrink: 0, boxSizing: 'border-box',
      padding: `${Math.round(Number(L.margemTop||8)*SC*0.6)}px ${Math.round(mX*SC*0.6)}px`,
    }}>
      {/* L1 Empresa */}
      <div style={{ textAlign: 'center', fontSize: pf(L.fontEmpresa), fontWeight: 700, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {empresa || '— EMPRESA —'}
      </div>
      {/* L2 CNPJ */}
      <div style={{ textAlign: 'center', fontSize: pf(L.fontCnpj), lineHeight: 1.15 }}>
        {cnpj ? `CNPJ: ${cnpj}` : '—'}
      </div>
      {/* L3 Descrição */}
      <div style={{ textAlign: 'center', fontSize: pf(L.fontDesc), fontWeight: 700, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {descricao || '—'}
      </div>
      {/* L4 Composição */}
      <div style={{ textAlign: 'center', fontSize: pf(L.fontComp), lineHeight: 1.15 }}>
        {compTit}
      </div>

      {/* Labels Máq/Ciclo/Fuso */}
      <div style={{ display: 'flex', marginTop: 2 }}>
        <div style={{ width: `${pMaq*100}%`, textAlign: 'center', fontSize: pf(L.fontLabel), color: '#666' }}>Maquina</div>
        <div style={{ width: `${pCiclo*100}%`, textAlign: 'center', fontSize: pf(L.fontLabel), color: '#666' }}>Ciclo</div>
        <div style={{ width: `${pFuso*100}%`, textAlign: 'center', fontSize: pf(L.fontLabel), color: '#666' }}>Fuso</div>
      </div>

      {/* Valores Máq/Ciclo/Fuso */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
        <div style={{ width: `${pMaq*100}%`, textAlign: 'center', fontSize: pf(L.fontMaq), fontWeight: 900, lineHeight: 1 }}>{maquina}</div>
        <div style={{ width: `${pCiclo*100}%`, textAlign: 'center', fontSize: pf(L.fontCiclo), fontWeight: 900, lineHeight: 1 }}>{cicloStr}</div>
        <div style={{ width: `${pFuso*100}%`, textAlign: 'center', fontSize: pf(L.fontFuso), fontWeight: 900, lineHeight: 1 }}>{fusoNum}</div>
      </div>

      {/* Lote / Data */}
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
        <div style={{ flex: 1, textAlign: 'center', fontSize: pf(L.fontLote), fontWeight: 700 }}>Lote {lote}</div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: pf(L.fontLote), fontWeight: 700 }}>{dataFmt}</div>
      </div>
    </div>
  )
}

export function LabelPreview({ record, layout = {} }) {
  const fusoBase = record?.fuso || 1
  const fusos = [0,1,2,3,4,5].map(i => fusoBase + i)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 8, padding: 16, width: '100%', boxSizing: 'border-box',
    }}>
      {/* Bloco 2×3 */}
      <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,.35)', border: '1px solid #888' }}>
        {[0, 1, 2].map(row => (
          <div key={row} style={{ display: 'flex' }}>
            <CelulaEtiqueta record={record} fusoNum={fusos[row*2]}   layout={layout} />
            <CelulaEtiqueta record={record} fusoNum={fusos[row*2+1]} layout={layout} />
          </div>
        ))}
      </div>
      <div style={{ fontSize: '.65rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
        2 colunas × 3 linhas = 6 etiquetas · 50×30mm cada · ZT230 · 200dpi
      </div>
    </div>
  )
}
