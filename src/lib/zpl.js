// src/lib/zpl.js
// Zebra ZT230 — 200dpi — Rolo 2 colunas × 3 linhas
// Largura total:  100mm = 786 dots  (2 × 393)
// Altura bloco:   90mm  = 708 dots  (3 × 236)
// Cada etiqueta:  50×30mm = 393×236 dots
//
// FONTES POR LINHA (^A0N,altura,largura):
//   L1 Empresa     : A0N,18,18  → ~2.3mm altura
//   L2 CNPJ        : A0N,15,14  → ~1.9mm altura
//   L3 Descrição   : A0N,16,15  → ~2.0mm altura
//   L4 Composição  : A0N,14,13  → ~1.8mm altura
//   Labels (Maq/Ciclo/Fuso) : A0N,11,10
//   Valor Máquina  : A0N,24,22  → ~3.0mm
//   Valor Ciclo    : A0N,24,22  → ~3.0mm
//   Valor Fuso     : A0N,36,34  → ~4.6mm  (destaque)
//   Lote / Data    : A0N,15,14  → ~1.9mm

function blocoEtiqueta(record, ox, oy) {
  const cicloStr = String(record.ciclo || 1).padStart(2, '0')
  const dataFmt  = record.data ? record.data.split('-').reverse().join('/') : ''
  const compTit  = [record.composicao, record.titulo ? `${record.titulo}TEX` : ''].filter(Boolean).join(' - ')

  const emp     = (record.empresa    || '').slice(0, 28)
  const cnpjStr = record.cnpj ? `CNPJ: ${record.cnpj}` : ''
  const desc    = (record.descricao  || '').slice(0, 28)
  const comp    = compTit.slice(0, 30)
  const maq     = String(record.maquina || '').slice(0, 10)
  const loteStr = String(record.lote   || '').slice(0, 14)
  const fusoStr = String(record.fuso   || '')

  // Largura interna: 393 - 8px margem = 385 dots
  // Divisão das colunas Máq/Ciclo/Fuso:
  //   Máquina : 140 dots (36%)
  //   Ciclo   : 100 dots (26%)
  //   Fuso    : 145 dots (38%) — maior para o número de destaque
  const W   = 385
  const xL  = ox + 4   // margem esquerda
  const c1w = 140      // col Máquina
  const c2w = 100      // col Ciclo
  const c3w = W - c1w - c2w  // col Fuso = 145

  const xC1 = xL
  const xC2 = xL + c1w
  const xC3 = xL + c1w + c2w

  return `
^FO${xL},${oy+4}^FB${W},1,0,C^A0N,18,18^FD${emp}^FS
^FO${xL},${oy+24}^FB${W},1,0,C^A0N,15,14^FD${cnpjStr}^FS
^FO${xL},${oy+41}^FB${W},1,0,C^A0N,16,15^FD${desc}^FS
^FO${xL},${oy+59}^FB${W},1,0,C^A0N,14,13^FD${comp}^FS
^FO${xL},${oy+75}^GB${W},2,2^FS
^FO${xC1},${oy+79}^FB${c1w},1,0,C^A0N,11,10^FDMaquina^FS
^FO${xC2},${oy+79}^FB${c2w},1,0,C^A0N,11,10^FDCiclo^FS
^FO${xC3},${oy+79}^FB${c3w},1,0,C^A0N,11,10^FDFuso^FS
^FO${xC1},${oy+92}^FB${c1w},1,0,C^A0N,24,22^FD${maq}^FS
^FO${xC2},${oy+92}^FB${c2w},1,0,C^A0N,24,22^FD${cicloStr}^FS
^FO${xC3},${oy+88}^FB${c3w},1,0,C^A0N,36,34^FD${fusoStr}^FS
^FO${xL},${oy+140}^GB${W},2,2^FS
^FO${xL},${oy+146}^FB${Math.floor(W/2)},1,0,C^A0N,15,14^FDLote: ${loteStr}^FS
^FO${xL+Math.floor(W/2)},${oy+146}^FB${Math.ceil(W/2)},1,0,C^A0N,15,14^FD${dataFmt}^FS`
}

export function buildZPL(record, config = {}) {
  return buildZPLDuplo(
    { ...record, fuso: record.fuso },
    { ...record, fuso: Number(record.fuso) + 1 },
    config
  )
}

export function buildZPLDuplo(rec1, rec2, config = {}, totalFusos = 99999) {
  const { vel = 3, dens = 15, offx = 0 } = config
  const H = 236

  const f1 = Number(rec1.fuso)
  const f2 = Number(rec2.fuso)

  const bloco = (rec, fuso, ox, oy) =>
    fuso <= totalFusos ? blocoEtiqueta({ ...rec, fuso }, ox, oy) : ''

  return `^XA
^MMT
^PW786
^LL${H * 3}
^LS${offx}
^LT0
^PR${vel},${vel}
~SD${dens}
^CI28
${bloco(rec1, f1,   0,   0    )}
${bloco(rec2, f2,   393, 0    )}
${bloco(rec1, f1+2, 0,   H    )}
${bloco(rec2, f2+2, 393, H    )}
${bloco(rec1, f1+4, 0,   H*2  )}
${bloco(rec2, f2+4, 393, H*2  )}
^PQ1,0,1,Y
^XZ`
}

export function buildZPLCiclo(baseRecord, config, totalFusos) {
  const zpls = []
  const totalBlocos = Math.ceil(totalFusos / 6)

  for (let bloco = totalBlocos; bloco >= 1; bloco--) {
    const fusoInicio = (bloco - 1) * 6 + 1
    const f = (n) => Math.min(n, totalFusos)
    zpls.push(buildZPLDuplo(
      { ...baseRecord, fuso: f(fusoInicio)     },
      { ...baseRecord, fuso: f(fusoInicio + 1) },
      config,
      totalFusos
    ))
  }
  return zpls.join('\n')
}

export function downloadZPL(content, filename) {
  const safeName = (filename || `etiqueta_${Date.now()}.zpl`).replace('.zpl', '.txt')
  const blob = new Blob([content], { type: 'application/octet-stream' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = safeName
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a) }, 500)
}

export async function printZPL(content, filename) {
  downloadZPL(content, filename)
  return 'download'
}
