// src/components/LabelPreview.jsx
// Preview fiel à etiqueta física — sem linhas, proporcional ao ZPL

import { LAYOUT_DEFAULT, LAYOUT_NILIT_DEFAULT } from '../lib/zpl'

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
    const parts = String(s).split(',')
    const h = Number(parts[0]) || 16
    const bold = parts[2] === 'B'
    return {
      size: Math.max(6, Math.round(h * SC * 0.72)),
      bold
    }
  }

  const mX      = Number(L.margemX) || 14
  const colMaq  = Number(L.colMaq)   || 135
  const colCiclo = Number(L.colCiclo) || 95
  const W       = 393 - mX * 2
  const pMaq    = colMaq   / W
  const pCiclo  = colCiclo / W
  const pFuso   = 1 - pMaq - pCiclo

  const fEmp = pf(L.fontEmpresa)
  const fCnpj = pf(L.fontCnpj)
  const fDesc = pf(L.fontDesc)
  const fComp = pf(L.fontComp)
  const fLbl  = pf(L.fontLabel)
  const fMaq  = pf(L.fontMaq)
  const fCiclo = pf(L.fontCiclo)
  const fFuso = pf(L.fontFuso)
  const fLote = pf(L.fontLote)

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
      <div style={{ textAlign: 'center', fontSize: fEmp.size, fontWeight: fEmp.bold ? 900 : 700, textShadow: fEmp.bold ? '0.8px 0px 0px black, 0px 0.8px 0px black, 0.8px 0.8px 0px black' : 'none', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {empresa || '— EMPRESA —'}
      </div>
      {/* L2 CNPJ */}
      <div style={{ textAlign: 'center', fontSize: fCnpj.size, fontWeight: fCnpj.bold ? 900 : 400, textShadow: fCnpj.bold ? '0.6px 0px 0px black, 0px 0.6px 0px black, 0.6px 0.6px 0px black' : 'none', lineHeight: 1.15 }}>
        {cnpj ? `CNPJ: ${cnpj}` : '—'}
      </div>
      {/* L3 Descrição */}
      <div style={{ textAlign: 'center', fontSize: fDesc.size, fontWeight: fDesc.bold ? 900 : 700, textShadow: fDesc.bold ? '0.8px 0px 0px black, 0px 0.8px 0px black, 0.8px 0.8px 0px black' : 'none', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {descricao || '—'}
      </div>
      {/* L4 Composição */}
      <div style={{ textAlign: 'center', fontSize: fComp.size, fontWeight: fComp.bold ? 900 : 400, textShadow: fComp.bold ? '0.6px 0px 0px black, 0px 0.6px 0px black, 0.6px 0.6px 0px black' : 'none', lineHeight: 1.15 }}>
        {compTit}
      </div>

      {/* Labels Máq/Ciclo/Fuso */}
      <div style={{ display: 'flex', marginTop: 2 }}>
        <div style={{ width: `${pMaq*100}%`, textAlign: 'center', fontSize: fLbl.size, fontWeight: fLbl.bold ? 900 : 400, color: '#666' }}>Maquina</div>
        <div style={{ width: `${pCiclo*100}%`, textAlign: 'center', fontSize: fLbl.size, fontWeight: fLbl.bold ? 900 : 400, color: '#666' }}>Ciclo</div>
        <div style={{ width: `${pFuso*100}%`, textAlign: 'center', fontSize: fLbl.size, fontWeight: fLbl.bold ? 900 : 400, color: '#666' }}>Fuso</div>
      </div>

      {/* Valores Máq/Ciclo/Fuso */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
        <div style={{ width: `${pMaq*100}%`, textAlign: 'center', fontSize: fMaq.size, fontWeight: fMaq.bold ? 900 : 900, lineHeight: 1 }}>{maquina}</div>
        <div style={{ width: `${pCiclo*100}%`, textAlign: 'center', fontSize: fCiclo.size, fontWeight: fCiclo.bold ? 900 : 900, lineHeight: 1 }}>{cicloStr}</div>
        <div style={{ width: `${pFuso*100}%`, textAlign: 'center', fontSize: fFuso.size, fontWeight: fFuso.bold ? 900 : 900, lineHeight: 1 }}>{fusoNum}</div>
      </div>

      {/* Lote / Data */}
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
        <div style={{ flex: 1, textAlign: 'center', fontSize: fLote.size, fontWeight: fLote.bold ? 900 : 700 }}>Lote {lote}</div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: fLote.size, fontWeight: fLote.bold ? 900 : 700 }}>{dataFmt}</div>
      </div>
    </div>
  )
}

function CelulaEtiquetaNilit({ record, layout = {} }) {
  const L = { ...LAYOUT_NILIT_DEFAULT, ...layout }

  const {
    opacidade = '', maquina = '', lote = '', data = '',
  } = record || {}

  // Escala: ZPL 504×276 dots → preview 240×131px
  const SC  = 240 / 504
  const pfH = s => {
    const parts = String(s).split(',')
    const h = Number(parts[0]) || 16
    const bold = parts[2] === 'B'
    return {
      size: Math.max(5, Math.round(h * SC)),
      bold
    }
  }
  const pD  = d => Math.max(1, Math.round(Number(d) * SC))

  const maqN    = String(maquina).replace(/\D/g, '').slice(-2).padStart(2, '0')
  const lote3   = String(lote).replace(/\D/g, '').slice(0, 3).padStart(3, '0')
  const code1   = `${String(opacidade).toUpperCase().slice(0, 2).padEnd(2, ' ')}${maqN}${lote3}`
  const dateFmt = data ? data.split('-').reverse().join('/') : '—'
  const op      = String(record?.operador || record?.op || '0001').slice(0, 4).padStart(4, '0')
  const lvStr   = String(record?.lv || 'A').toUpperCase()
  const ciclo   = record?.ciclo || 1
  const fuso    = record?.fuso || 1

  const fCode = pfH(L.fontCode)
  const fDate = pfH(L.fontDate)
  const fL2 = pfH(L.fontL2)
  const fL3 = pfH(L.fontL3)
  const fBc = pfH(L.fontBarcode)

  const desc = String(record?.descricao || '').slice(0, 16)
  const comp = String(record?.composicao || '').slice(0, 8)
  const maqFull = String(record?.maquina || '').slice(0, 8)

  return (
    <div className="label-preview-cell" style={{
      width: 240, height: 131,
      background: '#fff', color: '#000',
      fontFamily: 'Arial, Helvetica, sans-serif',
      overflow: 'hidden', border: '1px solid #ccc',
      flexShrink: 0, boxSizing: 'border-box',
      padding: `${pD(L.margemTop)}px ${pD(L.margemX)}px ${pD(L.margemX)}px`,
      display: 'flex', flexDirection: 'column', gap: 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px', paddingRight: '10px' }}>
        <div style={{ 
          fontSize: fCode.size, 
          fontWeight: fCode.bold ? 900 : 700, 
          textShadow: fCode.bold ? '1px 1px 0px black' : 'none',
          lineHeight: 1,
          flex: 1,
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          {code1}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: fDate.size, fontWeight: fDate.bold ? 900 : 700, lineHeight: 1 }}>{dataFmt}</div>
          <div style={{ fontSize: fDate.size, fontWeight: fDate.bold ? 900 : 700, lineHeight: 1.2, paddingRight: '15%' }}>{emissaoHora || '—:—'}</div>
        </div>
      </div>

      {/* Linha 2: Desc+Comp (L) e Maq+6200 (R) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px', gap: '8px', paddingRight: '10px' }}>
        <div style={{ 
          fontSize: fL2.size, 
          fontWeight: fL2.bold ? 900 : 700, 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          lineHeight: 1.1,
          flex: 1 
        }}>
          {desc} {comp}
        </div>
        <div style={{ 
          fontSize: fL2.size, 
          fontWeight: fL2.bold ? 900 : 700, 
          lineHeight: 1.1,
          flexShrink: 0,
          textAlign: 'right'
        }}>
          {maqFull} 6200{op}
        </div>
      </div>
      {/* Linha 3 */}
      <div style={{ fontSize: fL3.size, fontWeight: fL3.bold ? 900 : 700, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
        PO:{po || '—'}&nbsp;&nbsp;CG:{String(ciclo)}&nbsp;&nbsp;LV:{lvStr}&nbsp;&nbsp;POS:{String(fuso)}/1
      </div>
      {/* Barcode simulado */}
      <div style={{
        height: pD(L.barcodeHeight),
        background: `repeating-linear-gradient(90deg, #000 0px, #000 ${((Number(L.barcodeModule)||2) * SC * 0.4).toFixed(1)}px, #fff ${((Number(L.barcodeModule)||2) * SC * 0.4).toFixed(1)}px, #fff ${((Number(L.barcodeModule)||2) * (1 + (Number(L.barcodeRatio)||3)/3) * SC * 0.5).toFixed(1)}px)`,
        margin: '2px 0 1px', flexShrink: 0,
      }} />
      {/* Texto barcode */}
      <div style={{ fontSize: Math.max(4, fBc.size - 2), fontWeight: fBc.bold ? 900 : 400, textAlign: 'center', fontFamily: 'monospace', letterSpacing: 0.5 }}>
        B — — — — — — — —
      </div>
    </div>
  )
}

export function LabelPreview({ record, layout = {}, isNilit = false, layoutNilit = {} }) {
  if (isNilit) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: 16, width: '100%', boxSizing: 'border-box',
      }}>
        <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,.35)', border: '1px solid #888' }}>
          <CelulaEtiquetaNilit record={record} layout={layoutNilit} />
        </div>
        <div style={{ fontSize: '.65rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
          1 coluna · 64×35mm · Nilit · 200dpi
        </div>
      </div>
    )
  }

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
