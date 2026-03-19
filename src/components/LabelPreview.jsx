// src/components/LabelPreview.jsx
import { useEffect, useRef } from 'react'

function drawBarcode(svg, text) {
  svg.innerHTML = ''
  if (!text) return
  const W = 180, H = 22
  svg.setAttribute('width', W)
  svg.setAttribute('height', H)
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
  const chars = Array.from(text).map(c => c.charCodeAt(0))
  const pat = [1, 2, 3, 2, 1, 3, 1, 1, 2, 3, 2, 1]
  let x = 6, i = 0
  while (x < W - 6) {
    const bw = (pat[i % pat.length] + (chars[i % chars.length] % 3)) * 1.1
    if (i % 2 === 0) {
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      r.setAttribute('x', x); r.setAttribute('y', 0)
      r.setAttribute('width', bw); r.setAttribute('height', H)
      r.setAttribute('fill', '#000')
      svg.appendChild(r)
    }
    x += bw + 1.1; i++
  }
}

export function LabelPreview({ record }) {
  const bcRef = useRef(null)

  const {
    produto    = '',
    descricao  = '',
    lote       = '—',
    data       = '',
    fuso       = 1,
    maquina    = '—',
    composicao = '—',
    titulo     = '',
    empresa    = '',
    cnpj       = '',
    ciclo      = 1,
  } = record || {}

  const empresaStr = String(empresa || 'EMPRESA').toUpperCase().slice(0, 18)
  const cicloStr   = String(ciclo).padStart(6, '0')
  const dataFmt    = data ? data.split('-').reverse().join('/') : '—'
  const bcVal      = produto && lote !== '—' ? `${produto}-${lote}-C${cicloStr}-F${fuso}` : ''

  useEffect(() => {
    if (bcRef.current) drawBarcode(bcRef.current, bcVal)
  }, [bcVal])

  return (
    <div className="label-preview-wrap">
      <div className="label-preview">

        {/* Header: empresa + ciclo */}
        <div className="lbl-head">
          <span className="lbl-empresa">{empresaStr}</span>
          <span className="lbl-ciclo-badge">CICLO {cicloStr}</span>
        </div>

        {/* CNPJ */}
        {cnpj && (
          <div style={{ fontSize: '6.5px', color: '#666', marginBottom: 1 }}>{cnpj}</div>
        )}

        <div className="lbl-div" />

        {/* Produto */}
        <div className="lbl-prod">{produto || '— PRODUTO —'}</div>
        <div className="lbl-desc">{descricao || 'Descrição do produto'}</div>

        <div className="lbl-div" />

        {/* Campos */}
        <div className="lbl-row">
          <div className="lbl-field">
            <span className="lbl-k">LOTE</span>
            <span className="lbl-v">{lote}</span>
          </div>
          <div className="lbl-field">
            <span className="lbl-k">DATA</span>
            <span className="lbl-v">{dataFmt}</span>
          </div>
          <div className="lbl-field">
            <span className="lbl-k">FUSO Nº</span>
            <span className="lbl-v" style={{ fontSize: 11, fontWeight: 900 }}>{fuso}</span>
          </div>
          <div className="lbl-field">
            <span className="lbl-k">MÁQ</span>
            <span className="lbl-v">{maquina}</span>
          </div>
        </div>

        {/* Composição + Título */}
        <div className="lbl-comp">
          Comp.: {composicao}{titulo ? ` | Dtex: ${titulo}` : ''}
        </div>

        {/* Barcode */}
        <div className="lbl-bc">
          <svg ref={bcRef} width="180" height="22" xmlns="http://www.w3.org/2000/svg" />
          <div className="lbl-bc-num">{bcVal || '—'}</div>
        </div>

        {/* Footer */}
        <div className="lbl-foot">
          <span>Máq: {maquina} | Fuso: {fuso}</span>
          <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="label-hint">
        Real: 50×30mm · Zebra ZT230 · 200dpi · ZPL II · Code 128
      </div>
    </div>
  )
}
