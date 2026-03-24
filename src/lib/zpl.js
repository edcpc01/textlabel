// src/lib/zpl.js
// Zebra ZT230 — 200dpi — 50×30mm — 2 colunas × 3 linhas
// H=236 dots | W=393 dots por coluna

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
  margemX     : 14,
  margemTop   : 8,
  espacamento : 2,
}

function parseFont(s) {
  const [h, w] = String(s).split(',').map(Number)
  return { h: h || 16, w: w || 14 }
}

function blocoEtiqueta(record, ox, oy, L) {
  const cicloStr = String(record.ciclo || 1).padStart(2, '0')
  const dataFmt  = record.data ? record.data.split('-').reverse().join('/') : ''
  const compTit  = [record.composicao, record.titulo ? `${record.titulo}TEX` : '']
                    .filter(Boolean).join(' - ')

  // Aumentado para 34 chars para não cortar "LTDA"
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
  const mX = Number(L.margemX)     || 8

  const W   = 393 - mX * 2   // largura interna
  const xL  = ox + mX

  const colF = W - L.colMaq - L.colCiclo
  const xC1  = xL
  const xC2  = xL + L.colMaq
  const xC3  = xL + L.colMaq + L.colCiclo

  // ── Y dinâmico ──────────────────────────────
  // Ordem: Empresa → Sep → CNPJ → Descrição → Composição
  //        → Sep → Labels → Valores → Sep → Lote/Data
  let y = oy + mT

  const y1    = y;  y += fEmp.h + sp          // L1 Empresa

  // Linha separadora ABAIXO da Empresa, ANTES do CNPJ
  const ySep1 = y;  y += 3 + sp

  const y2    = y;  y += fCnpj.h + sp         // L2 CNPJ
  const y3    = y;  y += fDesc.h + sp          // L3 Descrição
  const y4    = y;  y += fComp.h + sp + 1      // L4 Composição

  // Separador antes de Máq/Ciclo/Fuso
  const ySep2 = y;  y += 3 + sp

  const yLbl  = y;  y += fLbl.h + 1            // Labels
  const hVal  = Math.max(fMaq.h, fFuso.h)
  const yVal  = y;  y += hVal + sp             // Valores

  // Separador antes de Lote/Data
  const ySep3 = y;  y += 3 + sp

  // Lote/Data — empurra para baixo se sobrar espaço
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
  const { vel = 3, dens = 15, offx = 0 } = config
  const H  = 236
  const f1 = Number(rec1.fuso)
  const f2 = Number(rec2.fuso)
  const b  = (rec, fuso, ox, oy) =>
    fuso <= totalFusos ? blocoEtiqueta({ ...rec, fuso }, ox, oy, L) : ''

  return `^XA
^MMT
^PW786
^LL${H*3}
^LS${offx}
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
