// src/lib/zpl.js
// Zebra ZT230 — 200dpi — Rolo 2 colunas × 3 linhas
// Cada coluna: 393 dots (50mm) — NUNCA ultrapassa esse limite

function blocoEtiqueta(record, ox, oy, layout = {}) {
  const {
    fontEmpresa  = '18,18',
    fontCnpj     = '15,14',
    fontDesc     = '16,15',
    fontComp     = '14,13',
    fontLabel    = '11,10',
    fontMaq      = '24,22',
    fontCiclo    = '24,22',
    fontFuso     = '36,34',
    fontLote     = '15,14',
    colMaq       = 135,    // largura col Máquina em dots
    colCiclo     = 95,     // largura col Ciclo em dots
    margemX      = 6,      // margem interna esquerda/direita
  } = layout

  const cicloStr = String(record.ciclo || 1).padStart(2, '0')
  const dataFmt  = record.data ? record.data.split('-').reverse().join('/') : ''
  const compTit  = [record.composicao, record.titulo ? `${record.titulo}TEX` : ''].filter(Boolean).join(' - ')

  const emp     = (record.empresa   || '').slice(0, 30)
  const cnpjStr = record.cnpj ? `CNPJ: ${record.cnpj}` : ''
  const desc    = (record.descricao || '').slice(0, 30)
  const comp    = compTit.slice(0, 32)
  const maq     = String(record.maquina || '').slice(0, 10)
  const loteStr = String(record.lote    || '').slice(0, 14)
  const fusoStr = String(record.fuso    || '')

  // Largura interna da etiqueta: 393 - 2×margem
  const W    = 393 - margemX * 2          // ex: 393-12=381
  const xL   = ox + margemX               // início do texto
  const colF = W - colMaq - colCiclo      // col Fuso (restante)

  const xC1  = xL
  const xC2  = xL + colMaq
  const xC3  = xL + colMaq + colCiclo

  return `
^FO${xL},${oy+4}^FB${W},1,0,C^A0N,${fontEmpresa}^FD${emp}^FS
^FO${xL},${oy+24}^FB${W},1,0,C^A0N,${fontCnpj}^FD${cnpjStr}^FS
^FO${xL},${oy+41}^FB${W},1,0,C^A0N,${fontDesc}^FD${desc}^FS
^FO${xL},${oy+59}^FB${W},1,0,C^A0N,${fontComp}^FD${comp}^FS
^FO${xL},${oy+75}^GB${W},2,2^FS
^FO${xC1},${oy+79}^FB${colMaq},1,0,C^A0N,${fontLabel}^FDMaquina^FS
^FO${xC2},${oy+79}^FB${colCiclo},1,0,C^A0N,${fontLabel}^FDCiclo^FS
^FO${xC3},${oy+79}^FB${colF},1,0,C^A0N,${fontLabel}^FDFuso^FS
^FO${xC1},${oy+92}^FB${colMaq},1,0,C^A0N,${fontMaq}^FD${maq}^FS
^FO${xC2},${oy+92}^FB${colCiclo},1,0,C^A0N,${fontCiclo}^FD${cicloStr}^FS
^FO${xC3},${oy+88}^FB${colF},1,0,C^A0N,${fontFuso}^FD${fusoStr}^FS
^FO${xL},${oy+140}^GB${W},2,2^FS
^FO${xL},${oy+146}^FB${Math.floor(W/2)},1,0,C^A0N,${fontLote}^FDLote: ${loteStr}^FS
^FO${xL+Math.floor(W/2)},${oy+146}^FB${Math.ceil(W/2)},1,0,C^A0N,${fontLote}^FD${dataFmt}^FS`
}

export function buildZPL(record, config = {}, layout = {}) {
  return buildZPLDuplo(
    { ...record, fuso: record.fuso },
    { ...record, fuso: Number(record.fuso) + 1 },
    config, 99999, layout
  )
}

export function buildZPLDuplo(rec1, rec2, config = {}, totalFusos = 99999, layout = {}) {
  const { vel = 3, dens = 15, offx = 0 } = config
  const H = 236

  const f1 = Number(rec1.fuso)
  const f2 = Number(rec2.fuso)

  const bloco = (rec, fuso, ox, oy) =>
    fuso <= totalFusos ? blocoEtiqueta({ ...rec, fuso }, ox, oy, layout) : ''

  // Coluna 2 começa EXATAMENTE em 393 dots — sem overlap
  return `^XA
^MMT
^PW786
^LL${H * 3}
^LS${offx}
^LT0
^PR${vel},${vel}
~SD${dens}
^CI28
${bloco(rec1, f1,   0,   0  )}
${bloco(rec2, f2,   393, 0  )}
${bloco(rec1, f1+2, 0,   H  )}
${bloco(rec2, f2+2, 393, H  )}
${bloco(rec1, f1+4, 0,   H*2)}
${bloco(rec2, f2+4, 393, H*2)}
^PQ1,0,1,Y
^XZ`
}

export function buildZPLCiclo(baseRecord, config, totalFusos, layout = {}) {
  const zpls = []
  const totalBlocos = Math.ceil(totalFusos / 6)
  for (let bloco = totalBlocos; bloco >= 1; bloco--) {
    const fi = (bloco - 1) * 6 + 1
    const f  = (n) => Math.min(n, totalFusos)
    zpls.push(buildZPLDuplo(
      { ...baseRecord, fuso: f(fi)   },
      { ...baseRecord, fuso: f(fi+1) },
      config, totalFusos, layout
    ))
  }
  return zpls.join('\n')
}

export function downloadZPL(content, filename) {
  const safeName = (filename || `etiqueta_${Date.now()}.zpl`).replace('.zpl', '.txt')
  const blob = new Blob([content], { type: 'application/octet-stream' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = safeName
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a) }, 500)
}

export async function printZPL(content, filename) {
  downloadZPL(content, filename)
  return 'download'
}
