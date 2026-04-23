// src/lib/zpl.js
// Zebra ZT230 — 200dpi — 50×30mm — 2 colunas × 3 linhas
// H=236 dots | Papel total=786 dots (2×393)

export const LAYOUT_DEFAULT = {
  fontEmpresa : '20,20',
  fontCnpj    : '18,18',
  fontDesc    : '24,24',
  fontComp    : '24,24',
  fontLabel   : '10,9',
  fontMaq     : '22,20',
  fontCiclo   : '22,20',
  fontFuso    : '30,30',
  fontLote    : '30,30',
  colMaq      : 135,
  colCiclo    : 95,
  margemX     : 14,   // margem lateral base (ajustável)
  margemTop   : 8,
  espacamento : 2,
}

function parseFont(s) {
  const [h, w] = String(s).split(',').map(Number)
  return { h: h || 16, w: w || 14 }
}

// ox=0 → coluna esquerda | ox=393 → coluna direita
function blocoEtiqueta(record, ox, oy, L) {
  const cicloStr = String(record.ciclo || 1).padStart(2, '0')
  const dataFmt  = record.data ? record.data.split('-').reverse().join('/') : ''
  const compTit  = [record.composicao, record.titulo ? `${record.titulo}TEX` : '']
                    .filter(Boolean).join(' - ')

  const emp     = (record.empresa   || '').slice(0, 34)
  const cnpjStr = record.cnpj ? `CNPJ: ${record.cnpj}` : ''
  const desc    = (record.descricao || '').slice(0, 32)
  const comp    = compTit.slice(0, 32)
  const maq     = String(record.maquina || '').slice(0, 10)
  const loteStr = String(record.lote    || '').slice(0, 14)
  const fusoStr = String(record.fuso    || '')

  const fEmp  = parseFont(L.fontEmpresa)
  const fCnpj = parseFont(L.fontCnpj)
  const fDesc = parseFont(L.fontDesc)
  const fComp = parseFont(L.fontComp)
  const fLbl  = parseFont(L.fontLabel)
  const fMaq  = parseFont(L.fontMaq)
  const fFuso = parseFont(L.fontFuso)
  const fLote = parseFont(L.fontLote)

  const sp = Number(L.espacamento) || 2
  const mT = Number(L.margemTop)   || 8
  const mX = Number(L.margemX)     || 14

  // ── Margens independentes por coluna ──
  // Coluna esquerda (ox=0): precisa de margem maior à ESQUERDA
  // Coluna direita (ox=393): precisa de margem maior à DIREITA
  // Isso compensa o offset físico da impressora em cada lado
  const isLeft = ox === 0
  const mLeft  = isLeft ? mX + 6 : mX      // col esq tem +6 dots à esquerda
  const mRight = isLeft ? mX     : mX + 24 // col dir tem +24 dots à direita

  const W  = 393 - mLeft - mRight  // largura do texto (~351 dots)
  const xL = ox + mLeft            // início do texto

  // Colunas Máq/Ciclo/Fuso proporcionais a W
  const colF = W - L.colMaq - L.colCiclo
  const xC1  = xL
  const xC2  = xL + L.colMaq
  const xC3  = xL + L.colMaq + L.colCiclo

  // ── Y dinâmico ──
  let y = oy + mT

  const y1    = y;  y += fEmp.h  + sp
  const ySep1 = y;  y += 3 + sp
  const y2    = y;  y += fCnpj.h + sp
  const y3    = y;  y += fDesc.h + sp
  const y4    = y;  y += fComp.h + sp + 1
  const ySep2 = y;  y += 3 + sp
  const yLbl  = y;  y += fLbl.h  + 1
  const hVal  = Math.max(fMaq.h, fFuso.h)
  const yVal  = y;  y += hVal    + sp
  const ySep3 = y;  y += 3 + sp
  const H_ETQ = 236
  const yLote = Math.min(y, oy + H_ETQ - fLote.h - 4)

  return `
^FO${xL},${y1}^FB${W},1,0,C^A0N,${fEmp.h},${fEmp.w}^FD${emp}^FS
^FO${xL},${y2}^FB${W},1,0,C^A0N,${fCnpj.h},${fCnpj.w}^FD${cnpjStr}^FS
^FO${xL},${y3}^FB${W},1,0,C^A0N,${fDesc.h},${fDesc.w}^FD${desc}^FS
^FO${xL},${y4}^FB${W},1,0,C^A0N,${fComp.h},${fComp.w}^FD${comp}^FS
^FO${xC1},${yLbl}^FB${L.colMaq},1,0,C^A0N,${fLbl.h},${fLbl.w}^FDMaquina^FS
^FO${xC2},${yLbl}^FB${L.colCiclo},1,0,C^A0N,${fLbl.h},${fLbl.w}^FDCiclo^FS
^FO${xC3},${yLbl}^FB${colF},1,0,C^A0N,${fLbl.h},${fLbl.w}^FDFuso^FS
^FO${xC1},${yVal}^FB${L.colMaq},1,0,C^A0N,${fMaq.h},${fMaq.w}^FD${maq}^FS
^FO${xC2},${yVal}^FB${L.colCiclo},1,0,C^A0N,${fMaq.h},${fMaq.w}^FD${cicloStr}^FS
^FO${xC3},${yVal}^FB${colF},1,0,C^A0N,${fFuso.h},${fFuso.w}^FD${fusoStr}^FS
^FO${xL},${yLote}^FB${Math.floor(W/2)},1,0,C^A0N,${fLote.h},${fLote.w}^FDLote: ${loteStr}^FS
^FO${xL+Math.floor(W/2)},${yLote}^FB${Math.ceil(W/2)},1,0,C^A0N,${fLote.h},${fLote.w}^FD${dataFmt}^FS`
}

export function buildZPL(record, config = {}, layout = {}) {
  const L = { ...LAYOUT_DEFAULT, ...layout }
  return buildZPLDuplo({ ...record }, { ...record, fuso: Number(record.fuso)+1 }, config, 99999, L)
}

export function buildZPLDuplo(rec1, rec2, config = {}, totalFusos = 99999, layout = {}) {
  const L  = { ...LAYOUT_DEFAULT, ...layout }
  const { vel = 3, dens = 15, offx = -24 } = config
  const lshift = offx  // offset físico da ZT230
  const H  = 236
  const f1 = Number(rec1.fuso)
  const f2 = Number(rec2.fuso)
  const b  = (rec, fuso, ox, oy) =>
    fuso <= totalFusos ? blocoEtiqueta({ ...rec, fuso }, ox, oy, L) : ''

  return `^XA
^MMT
^PW786
^LL${H*3}
^LS${lshift}
^LT0
^PR${vel},${vel}
~SD${dens}
^CI28
${b(rec1,f1,   0,   0  )}
${b(rec2,f2,   393, 0  )}
${b(rec1,f1+2, 0,   H  )}
${b(rec2,f2+2, 393, H  )}
${b(rec1,f1+4, 0,   H*2)}
${b(rec2,f2+4, 393, H*2)}
^PQ1,0,1,Y
^XZ`
}

export function buildZPLCiclo(baseRecord, config, totalFusos, layout = {}) {
  const L = { ...LAYOUT_DEFAULT, ...layout }
  const zpls = []
  const totalBlocos = Math.ceil(totalFusos / 6)
  for (let bloco = totalBlocos; bloco >= 1; bloco--) {
    const fi = (bloco-1)*6+1
    const f  = n => Math.min(n, totalFusos)
    zpls.push(buildZPLDuplo(
      { ...baseRecord, fuso: f(fi)   },
      { ...baseRecord, fuso: f(fi+1) },
      config, totalFusos, L
    ))
  }
  return zpls.join('\n')
}

export function downloadZPL(content, filename) {
  const safeName = (filename||`etiqueta_${Date.now()}.zpl`).replace('.zpl','.txt')
  const blob = new Blob([content], { type: 'application/octet-stream' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href=url; a.download=safeName; a.style.display='none'
  document.body.appendChild(a); a.click()
  setTimeout(()=>{ URL.revokeObjectURL(url); document.body.removeChild(a) }, 500)
}

export async function printZPL(content, filename) {
  downloadZPL(content, filename); return 'download'
}

// ─── NILIT — 64×35mm — 1 coluna — 200dpi ──────────────
// Width: 504 dots | Height: 276 dots

export const LAYOUT_NILIT_DEFAULT = {
  fontCode:      '44,38',  // Linha 1 — código (BK02111)
  fontDate:      '22,18',  // Linha 1 — data e hora (direita)
  fontL2:        '20,14',  // Linha 2 — produto / máquina / comp / operador
  fontL3:        '20,14',  // Linha 3 — PO / CG / LV / POS
  fontBarcode:   '20,16',  // Texto abaixo do barcode
  barcodeHeight: 100,      // Altura do barcode em dots
  barcodeModule: 2,        // Largura do módulo (BY — 1 a 4 dots)
  margemTop:     8,
  margemX:       8,
}

function maqNums2(maquinaCod) {
  return String(maquinaCod || '').replace(/\D/g, '').slice(-2).padStart(2, '0')
}

function lote3d(loteStr) {
  return String(loteStr || '').replace(/\D/g, '').slice(0, 3).padStart(3, '0')
}

export function buildZPLNilit(record, config = {}, layout = {}) {
  const L   = { ...LAYOUT_NILIT_DEFAULT, ...layout }
  const { vel = 3, dens = 15, offx = 0 } = config
  const {
    opacidade = '', maquina = '', lote = '', data = '',
    emissaoHora = '', descricao = '', composicao = '',
    operador = '', po = '', ciclo = 1, lv = 'A',
    fuso = 1, barcode = 'B000000000',
  } = record

  const fCode = parseFont(L.fontCode)
  const fDate = parseFont(L.fontDate)
  const fL2   = parseFont(L.fontL2)
  const fL3   = parseFont(L.fontL3)
  const fBc   = parseFont(L.fontBarcode)
  const mT    = Number(L.margemTop)     || 8
  const mX    = Number(L.margemX)       || 8
  const bH    = Number(L.barcodeHeight) || 100
  const bW    = Math.max(1, Number(L.barcodeModule) || 2)

  // Y dinâmico baseado no layout
  const yCode    = mT
  const ySep     = mT + fCode.h + 3
  const yL2      = ySep + 5
  const yL3      = yL2 + fL2.h + 4
  const yBarcode = yL3 + fL3.h + 8
  const yBcText  = yBarcode + bH + 4

  // X direita — data e hora alinhadas à margem direita
  const W     = 504 - 2 * mX
  const xDate = 504 - mX - 10 * fDate.w                        // DD/MM/YYYY
  const xTime = xDate + Math.floor((10 - 5) * fDate.w / 2)     // HH:MM centralizado

  const opacity2 = String(opacidade).toUpperCase().slice(0, 2).padEnd(2, ' ')
  const code1    = `${opacity2}${maqNums2(maquina)}${lote3d(lote)}`
  const dateFmt  = data ? data.split('-').reverse().join('/') : ''
  const hora     = emissaoHora || ''
  const desc     = String(descricao  || '').slice(0, 16)
  const comp     = String(composicao || '').slice(0, 8)
  const maqFull  = String(maquina    || '').slice(0, 8)
  const op       = String(operador   || '').slice(0, 4).padStart(4, '0')
  const cicloStr = String(ciclo)
  const fusoStr  = String(fuso)
  const lvStr    = String(lv || 'A').toUpperCase().slice(0, 1)

  return `^XA
^MMT
^PW504
^LL276
^LS${offx}
^LT0
^PR${vel},${vel}
~SD${dens}
^CI28
^FO${mX},${yCode}^A0N,${fCode.h},${fCode.w}^FD${code1}^FS
^FO${xDate},${yCode}^A0N,${fDate.h},${fDate.w}^FD${dateFmt}^FS
^FO${xTime},${yCode + fDate.h + 1}^A0N,${fDate.h},${fDate.w}^FD${hora}^FS
^FO${mX},${yL2}^A0N,${fL2.h},${fL2.w}^FB${W},1,0,L^FD${desc}  ${maqFull}  ${comp}  6200${op}^FS
^FO${mX},${yL3}^A0N,${fL3.h},${fL3.w}^FB${W},1,0,L^FDPO:${po}  CG:${cicloStr}  LV:${lvStr}  POS:${fusoStr}/1^FS
^FO${mX},${yBarcode}^BY${bW},3,${bH}^BCN,${bH},N,N^FD${barcode}^FS
^FO${mX},${yBcText}^FB${W},1,0,C^A0N,${fBc.h},${fBc.w}^FD${barcode}^FS
^PQ1,0,1,Y
^XZ`
}

export function buildZPLNilitCiclo(baseRecord, config, barcodes, totalFusos, layout = {}) {
  const zpls = []
  for (let fuso = totalFusos; fuso >= 1; fuso--) {
    zpls.push(buildZPLNilit({
      ...baseRecord,
      fuso,
      barcode: (barcodes && barcodes[fuso - 1]) || 'B000000000',
    }, config, layout))
  }
  return zpls.join('\n')
}
