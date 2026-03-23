// src/lib/zpl.js
// Zebra ZT230 — 200dpi — Rolo 2 colunas lado a lado
// Largura total: 100mm = 786 dots (2 × 393)
// Altura etiqueta: 30mm = 236 dots

export function buildZPL(record, config = {}) {
  const {
    empresa    = '',
    cnpj       = '',
    composicao = '',
    descricao  = '',
    titulo     = '',
    maquina    = '',
    ciclo      = 1,
    fuso       = '',
    lote       = '',
    data       = '',
  } = record

  const { vel = 3, dens = 15, offx = 0 } = config

  const cicloStr = String(ciclo).padStart(2, '0')
  const dataFmt  = data ? data.split('-').reverse().join('/') : ''
  const compTit  = [composicao, titulo ? `${titulo}TEX` : ''].filter(Boolean).join(' - ')

  const emp     = empresa.slice(0, 30)
  const cnpjStr = cnpj ? `CNPJ: ${cnpj}` : ''
  const desc    = descricao.slice(0, 30)
  const comp    = compTit.slice(0, 30)
  const maq     = String(maquina).slice(0, 8)
  const loteStr = String(lote).slice(0, 14)

  // Gera bloco ZPL para UMA etiqueta dado um offset X (coluna)
  const etiqueta = (ox) => `
^FO${ox+4},6^FB385,1,0,C^A0N,20,18^FD${emp}^FS
^FO${ox+4},28^FB385,1,0,C^A0N,16,15^FD${cnpjStr}^FS
^FO${ox+4},48^FB385,1,0,C^A0N,18,16^FD${desc}^FS
^FO${ox+4},68^FB385,1,0,C^A0N,16,14^FD${comp}^FS
^FO${ox+4},88^GB385,2,2^FS
^FO${ox+4},96^FB128,1,0,C^A0N,30,28^FD${maq}^FS
^FO${ox+132},96^FB128,1,0,C^A0N,30,28^FD${cicloStr}^FS
^FO${ox+260},92^FB129,1,0,C^A0N,42,40^FD${String(fuso)}^FS
^FO${ox+4},148^GB385,2,2^FS
^FO${ox+4},155^FB192,1,0,C^A0N,18,17^FDLote: ${loteStr}^FS
^FO${ox+196},155^FB193,1,0,C^A0N,18,17^FD${dataFmt}^FS`

  // Coluna 1: offset 0 | Coluna 2: offset 393
  return `^XA
^MMT
^PW786
^LL236
^LS${offx}
^LT0
^PR${vel},${vel}
~SD${dens}
^CI28
${etiqueta(0)}
${etiqueta(393)}
^PQ1,0,1,Y
^XZ`
}

// Gera ZPL com pares de fusos (col1=fuso N, col2=fuso N+1)
export function buildZPLCiclo(baseRecord, config, totalFusos) {
  const zpls = []
  for (let fuso = 1; fuso <= totalFusos; fuso += 2) {
    const fuso2 = fuso + 1
    if (fuso2 <= totalFusos) {
      // Par completo: 2 etiquetas lado a lado
      const zpl1 = buildZPLDuplo(
        { ...baseRecord, fuso },
        { ...baseRecord, fuso: fuso2 },
        config
      )
      zpls.push(zpl1)
    } else {
      // Último fuso ímpar: repete na col2
      const zpl1 = buildZPLDuplo(
        { ...baseRecord, fuso },
        { ...baseRecord, fuso },
        config
      )
      zpls.push(zpl1)
    }
  }
  return zpls.join('\n')
}

// Gera ZPL com 2 etiquetas diferentes lado a lado
export function buildZPLDuplo(rec1, rec2, config = {}) {
  const { vel = 3, dens = 15, offx = 0 } = config

  const bloco = (record, ox) => {
    const cicloStr = String(record.ciclo).padStart(2, '0')
    const dataFmt  = record.data ? record.data.split('-').reverse().join('/') : ''
    const compTit  = [record.composicao, record.titulo ? `${record.titulo}TEX` : ''].filter(Boolean).join(' - ')
    const emp     = (record.empresa || '').slice(0, 30)
    const cnpjStr = record.cnpj ? `CNPJ: ${record.cnpj}` : ''
    const desc    = (record.descricao || '').slice(0, 30)
    const comp    = compTit.slice(0, 30)
    const maq     = String(record.maquina || '').slice(0, 8)
    const loteStr = String(record.lote || '').slice(0, 14)

    return `
^FO${ox+4},6^FB385,1,0,C^A0N,20,18^FD${emp}^FS
^FO${ox+4},28^FB385,1,0,C^A0N,16,15^FD${cnpjStr}^FS
^FO${ox+4},48^FB385,1,0,C^A0N,18,16^FD${desc}^FS
^FO${ox+4},68^FB385,1,0,C^A0N,16,14^FD${comp}^FS
^FO${ox+4},88^GB385,2,2^FS
^FO${ox+4},96^FB128,1,0,C^A0N,30,28^FD${maq}^FS
^FO${ox+132},96^FB128,1,0,C^A0N,30,28^FD${cicloStr}^FS
^FO${ox+260},92^FB129,1,0,C^A0N,42,40^FD${String(record.fuso)}^FS
^FO${ox+4},148^GB385,2,2^FS
^FO${ox+4},155^FB192,1,0,C^A0N,18,17^FDLote: ${loteStr}^FS
^FO${ox+196},155^FB193,1,0,C^A0N,18,17^FD${dataFmt}^FS`
  }

  return `^XA
^MMT
^PW786
^LL236
^LS${offx}
^LT0
^PR${vel},${vel}
~SD${dens}
^CI28
${bloco(rec1, 0)}
${bloco(rec2, 393)}
^PQ1,0,1,Y
^XZ`
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
