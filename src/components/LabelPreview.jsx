// src/components/LabelPreview.jsx
import { LAYOUT_DEFAULT, LAYOUT_NILIT_DEFAULT } from '../lib/zpl'

function CelulaEtiqueta({ record, fusoNum, layout = {} }) {
  const L = { ...LAYOUT_DEFAULT, ...layout }
  const SC = 0.47
  const pf = (s) => {
    const parts = String(s || '16,14').split(',')
    const h = Number(parts[0]) || 16
    const bold = parts[2] === 'B'
    return { size: Math.max(6, Math.round(h * SC * 0.72)), bold }
  }

  const {
    empresa = '', cnpj = '', composicao = '', descricao = '',
    titulo = '', maquina = '—', ciclo = 1, lote = '—', data = '',
  } = record || {}

  const dataFmt = data ? data.split('-').reverse().join('/') : '—'
  const compTit = [composicao, titulo ? `${titulo}TEX` : ''].filter(Boolean).join(' - ') || '—'
  const mX = Number(L.margemX) || 14
  const W = 393 - mX * 2
  
  const fEmp = pf(L.fontEmpresa); const fCnpj = pf(L.fontCnpj); const fDesc = pf(L.fontDesc)
  const fComp = pf(L.fontComp); const fLbl = pf(L.fontLabel); const fMaq = pf(L.fontMaq)
  const fCiclo = pf(L.fontCiclo); const fFuso = pf(L.fontFuso); const fLote = pf(L.fontLote)

  return (
    <div style={{
      width: 185, height: 111, background: '#fff', color: '#000',
      fontFamily: 'Arial, Helvetica, sans-serif', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', border: '1px solid #ccc', flexShrink: 0, boxSizing: 'border-box',
      padding: `${Math.round(8*SC)}px ${Math.round(mX*SC)}px`,
    }}>
      <div style={{ textAlign: 'center', fontSize: fEmp.size, fontWeight: 700 }}>{empresa}</div>
      <div style={{ textAlign: 'center', fontSize: fCnpj.size }}>{cnpj ? `CNPJ: ${cnpj}` : ''}</div>
      <div style={{ textAlign: 'center', fontSize: fDesc.size, fontWeight: 700 }}>{descricao}</div>
      <div style={{ textAlign: 'center', fontSize: fComp.size }}>{compTit}</div>
      <div style={{ display: 'flex', marginTop: 'auto', fontSize: fLbl.size, color: '#666' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>Máq: {maquina}</div>
        <div style={{ flex: 1, textAlign: 'center' }}>Ciclo: {ciclo}</div>
        <div style={{ flex: 1, textAlign: 'center' }}>Fuso: {fusoNum}</div>
      </div>
      <div style={{ display: 'flex', fontSize: fLote.size, fontWeight: 700 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>Lote {lote}</div>
        <div style={{ flex: 1, textAlign: 'center' }}>{dataFmt}</div>
      </div>
    </div>
  )
}

function CelulaEtiquetaNilit({ record, layout = {} }) {
  const L = { ...LAYOUT_NILIT_DEFAULT, ...layout }
  const SC = 240 / 504
  const pfH = s => {
    const parts = String(s || '16,14').split(',')
    const h = Number(parts[0]) || 16
    const bold = parts[2] === 'B'
    const size = Math.round(h * SC)
    return { size: isNaN(size) ? 8 : Math.max(5, size), bold }
  }
  const pD = d => {
    const val = Math.round(Number(d || 0) * SC)
    return isNaN(val) ? 1 : Math.max(1, val)
  }

  // Dados com fallbacks seguros
  const r = record || {}
  const code1 = `${String(r.opacidade||'').toUpperCase().slice(0,2).padEnd(2,' ')}${String(r.maquina||'').replace(/\D/g,'').slice(-2).padStart(2,'0')}${String(r.lote||'').replace(/\D/g,'').slice(0,3).padStart(3,'0')}`
  const dataFmt = r.data ? r.data.split('-').reverse().join('/') : '--/--/--'
  const horaFmt = r.emissaoHora || '--:--'
  const descFull = `${String(r.descricao||'').slice(0,16)} ${String(r.composicao||'').slice(0,8)}`
  const maqCode = `${String(r.maquina||'').slice(0,8)} 6200${String(r.operador || r.op || '0001').slice(0,4).padStart(4,'0')}`
  
  const fCode = pfH(L.fontCode); const fDate = pfH(L.fontDate)
  const fL2 = pfH(L.fontL2); const fL3 = pfH(L.fontL3); const fBc = pfH(L.fontBarcode)

  return (
    <div style={{
      width: 240, height: 131, background: '#fff', color: '#000',
      fontFamily: 'Arial, Helvetica, sans-serif', overflow: 'hidden', border: '1px solid #ccc',
      flexShrink: 0, boxSizing: 'border-box',
      padding: `${pD(L.margemTop)}px ${pD(L.margemX)}px ${pD(L.margemX)}px`,
      display: 'flex', flexDirection: 'column', gap: 1,
    }}>
      {/* L1 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '10px' }}>
        <div style={{ fontSize: fCode.size, fontWeight: fCode.bold ? 900 : 700, textShadow: fCode.bold ? '1px 1px 0px black' : 'none' }}>{code1}</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: fDate.size, fontWeight: 700 }}>{dataFmt}</div>
          <div style={{ fontSize: fDate.size, fontWeight: 700, paddingRight: '15%' }}>{horaFmt}</div>
        </div>
      </div>
      {/* L2 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2, paddingRight: '10px' }}>
        <div style={{ fontSize: fL2.size, fontWeight: 700, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>{descFull}</div>
        <div style={{ fontSize: fL2.size, fontWeight: 700, textAlign: 'right' }}>{maqCode}</div>
      </div>
      {/* L3 */}
      <div style={{ fontSize: fL3.size, fontWeight: 700, marginTop: 2 }}>
        PO:{r.po || '--'}  CG:{r.ciclo || 1}  LV:{r.lv || 'A'}  POS:{r.fuso || 1}/1
      </div>
      {/* Barcode */}
      <div style={{
        height: pD(L.barcodeHeight || 60), margin: '2px 0', flexShrink: 0,
        background: `repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px)`
      }} />
      <div style={{ fontSize: fBc.size, textAlign: 'center', fontFamily: 'monospace' }}>{r.barcode || 'B000000000'}</div>
    </div>
  )
}

export function LabelPreview({ record, layout = {}, isNilit = false, layoutNilit = {} }) {
  if (isNilit) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16 }}>
        <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,.35)' }}>
          <CelulaEtiquetaNilit record={record} layout={layoutNilit} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        <CelulaEtiqueta record={record} fusoNum={record?.fuso || 1} layout={layout} />
      </div>
    </div>
  )
}
