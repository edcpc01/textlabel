// src/lib/zpl.js
// Zebra ZT230 — ZDesigner — 200dpi — Etiqueta 50×30mm
// 200dpi: 1mm ≈ 7.874 dots  |  50mm = 393 dots (PW)  |  30mm = 236 dots (LL)

export function buildZPL(record, config = {}) {
  const {
    produto = '', descricao = '', lote = '', data = '',
    fuso = '', maquina = '', composicao = '',
    ciclo = 1,
  } = record

  const {
    empresaNome = 'EMPRESA',
    vel  = 3,
    dens = 15,
    offx = 0,
  } = config

  const empresaStr = String(empresaNome).toUpperCase().slice(0, 22)
  const cicloStr   = String(ciclo).padStart(6, '0')
  const dataFmt    = data ? data.split('-').reverse().join('/') : ''
  const bcVal      = `${produto}-${lote}-C${cicloStr}-F${fuso}`

  return `^XA
^MMT
^PW393
^LL236
^LS${offx}
^LT0
^PR${vel},${vel}
~SD${dens}
^CI28

^FO4,4^GB385,228,2^FS

^FO8,8^A0N,13,13^FD${empresaStr}^FS
^FO8,8^FB377,1,0,R^A0N,11,11^FDCICLO: ${cicloStr}^FS
^FO8,25^GB377,2,2^FS

^FO8,30^A0N,17,17^FD${String(produto).slice(0, 20)}^FS
^FO8,50^A0N,11,11^FD${String(descricao).slice(0, 32)}^FS
^FO8,64^GB377,1,1^FS

^FO8,68^A0N,11,11^FDLOTE: ${String(lote).slice(0, 18)}^FS
^FO200,68^A0N,11,11^FDDATA: ${dataFmt}^FS
^FO8,82^A0N,14,14^FDFUSO N.: ${fuso}^FS
^FO200,82^A0N,11,11^FDMAQ: ${String(maquina).slice(0, 10)}^FS
^FO8,98^A0N,10,10^FDComp.: ${String(composicao).slice(0, 32)}^FS
^FO8,110^GB377,1,1^FS

^FO24,114^BY1.5^BCN,48,N,N,N^FD${bcVal}^FS
^FO24,165^A0N,9,9^FD${bcVal}^FS
^FO8,178^GB377,1,1^FS
^FO8,182^A0N,10,10^FDMáq: ${maquina} | Fuso: ${fuso}^FS
^FO8,182^FB377,1,0,R^A0N,9,9^FD${new Date().toLocaleString('pt-BR')}^FS

^PQ1,0,1,Y
^XZ`
}

// Gera um ZPL com múltiplas etiquetas (uma por fuso, usando ^PQ com contador)
// Alternativa: gera arquivo único com todas as etiquetas concatenadas
export function buildZPLCiclo(baseRecord, config, totalFusos) {
  const zpls = []
  for (let fuso = 1; fuso <= totalFusos; fuso++) {
    zpls.push(buildZPL({ ...baseRecord, fuso }, config))
  }
  return zpls.join('\n')
}

export function downloadZPL(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename || `etiqueta_${Date.now()}.zpl`
  a.click()
  URL.revokeObjectURL(a.href)
}

export function printZPL(content, filename) {
  if (window.BrowserPrint) {
    window.BrowserPrint.getDefaultDevice('printer',
      dev => dev.send(content, null, () => downloadZPL(content, filename)),
      ()   => downloadZPL(content, filename)
    )
  } else {
    downloadZPL(content, filename)
  }
}
