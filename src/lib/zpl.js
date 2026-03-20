// src/lib/zpl.js
// Zebra ZT230 — ZDesigner — 200dpi — Etiqueta 50×30mm

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

  return `^XA
^MMT
^PW393
^LL236
^LS${offx}
^LT0
^PR${vel},${vel}
~SD${dens}
^CI28

^FO0,8^FB393,1,0,C^A0N,24,22^FD${empresa.slice(0,36)}^FS
^FO0,36^FB393,1,0,C^A0N,20,18^FD${cnpj ? `CNPJ: ${cnpj}` : ''}^FS
^FO0,60^FB393,1,0,C^A0N,20,18^FD${descricao.slice(0,36)}^FS
^FO0,84^FB393,1,0,C^A0N,18,16^FD${compTit.slice(0,40)}^FS

^FO0,106^GB393,2,2^FS

^FO0,114^FB130,1,0,C^A0N,34,30^FD${String(maquina).slice(0,6)}^FS
^FO130,114^FB130,1,0,C^A0N,34,30^FD${cicloStr}^FS
^FO260,110^FB133,1,0,C^A0N,46,42^FD${String(fuso)}^FS

^FO0,164^GB393,2,2^FS

^FO0,172^FB196,1,0,C^A0N,22,20^FDLote: ${String(lote)}^FS
^FO196,172^FB197,1,0,C^A0N,22,20^FD${dataFmt}^FS

^PQ1,0,1,Y
^XZ`
}

export function buildZPLCiclo(baseRecord, config, totalFusos) {
  const zpls = []
  for (let fuso = 1; fuso <= totalFusos; fuso++) {
    zpls.push(buildZPL({ ...baseRecord, fuso }, config))
  }
  return zpls.join('\n')
}

// Download silencioso — salva como .txt para evitar bloqueio do Windows Defender
// e evitar que o Chrome abra o diálogo de impressão
export function downloadZPL(content, filename) {
  const safeName = (filename || `etiqueta_${Date.now()}.zpl`).replace('.zpl', '.txt')
  const blob = new Blob([content], { type: 'application/octet-stream' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = safeName
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  // Pequeno delay antes de revogar para garantir o download
  setTimeout(() => {
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }, 500)
}

export async function printZPL(content, filename) {
  downloadZPL(content, filename)
  return 'download'
}
