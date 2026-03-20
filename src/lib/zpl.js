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

export function downloadZPL(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename || `etiqueta_${Date.now()}.zpl`
  a.click()
  URL.revokeObjectURL(a.href)
}

// ─── IMPRESSÃO DIRETA ──────────────────────────────────
// Tenta 3 métodos em ordem:
// 1. Zebra BrowserPrint SDK (se instalado)
// 2. Servidor local textlabel-print (porta 9100 bridge)
// 3. Fallback: download do arquivo .zpl

export async function printZPL(content, filename, onStatus) {
  const status = onStatus || (() => {})

  // ── Método 1: Zebra BrowserPrint ──
  if (window.BrowserPrint) {
    status('browserprint')
    return new Promise(resolve => {
      window.BrowserPrint.getDefaultDevice('printer',
        dev => {
          dev.send(content,
            () => { status('ok'); resolve('browserprint') },
            err => {
              status('fallback')
              downloadZPL(content, filename)
              resolve('download')
            }
          )
        },
        () => {
          status('fallback')
          downloadZPL(content, filename)
          resolve('download')
        }
      )
    })
  }

  // ── Método 2: Servidor local (textlabel-print bridge) ──
  try {
    status('bridge')
    const res = await fetch('http://127.0.0.1:9191/print', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: content,
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      status('ok')
      return 'bridge'
    }
  } catch {}

  // ── Método 3: Download ──
  status('download')
  downloadZPL(content, filename)
  return 'download'
}
