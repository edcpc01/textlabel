// src/lib/zpl.js
// Zebra ZT230 — 200dpi — Rolo 2 colunas × 3 linhas
// Largura total:  100mm = 786 dots  (2 × 393)
// Altura bloco:   90mm  = 709 dots  (3 × 236 + 1 gap)
// Cada etiqueta:  50×30mm = 393×236 dots

export function buildZPL(record, config = {}) {
  return buildZPLDuplo(
    { ...record, fuso: record.fuso },
    { ...record, fuso: Number(record.fuso) + 1 },
    config
  )
}

// Bloco ZPL de UMA etiqueta dado offset X e Y
function blocoEtiqueta(record, ox, oy) {
  const cicloStr = String(record.ciclo || 1).padStart(2, '0')
  const dataFmt  = record.data ? record.data.split('-').reverse().join('/') : ''
  const compTit  = [record.composicao, record.titulo ? `${record.titulo}TEX` : ''].filter(Boolean).join(' - ')
  const emp      = (record.empresa    || '').slice(0, 28)
  const cnpjStr  = record.cnpj ? `CNPJ: ${record.cnpj}` : ''
  const desc     = (record.descricao  || '').slice(0, 28)
  const comp     = compTit.slice(0, 28)
  const maq      = String(record.maquina || '').slice(0, 8)
  const loteStr  = String(record.lote   || '').slice(0, 14)
  const fusoStr  = String(record.fuso   || '')

  // Largura de cada coluna: 393 dots
  // Linha do separador vertical entre colunas de máquina/ciclo/fuso
  const W   = 385   // largura interna da etiqueta
  const c1w = 110   // largura col Máquina
  const c2w = 110   // largura col Ciclo
  const c3w = W - c1w - c2w  // largura col Fuso

  return `
^FO${ox+4},${oy+4}^FB${W},1,0,C^A0N,18,17^FD${emp}^FS
^FO${ox+4},${oy+24}^FB${W},1,0,C^A0N,15,14^FD${cnpjStr}^FS
^FO${ox+4},${oy+41}^FB${W},1,0,C^A0N,16,15^FD${desc}^FS
^FO${ox+4},${oy+59}^FB${W},1,0,C^A0N,14,13^FD${comp}^FS
^FO${ox+4},${oy+75}^GB${W},2,2^FS
^FO${ox+4},${oy+80}^FB${c1w},1,0,C^A0N,14,12^FDMaquina^FS
^FO${ox+4+c1w},${oy+80}^FB${c2w},1,0,C^A0N,14,12^FDCiclo^FS
^FO${ox+4+c1w+c2w},${oy+80}^FB${c3w},1,0,C^A0N,14,12^FDFuso^FS
^FO${ox+4},${oy+94}^FB${c1w},1,0,C^A0N,26,24^FD${maq}^FS
^FO${ox+4+c1w},${oy+94}^FB${c2w},1,0,C^A0N,26,24^FD${cicloStr}^FS
^FO${ox+4+c1w+c2w},${oy+90}^FB${c3w},1,0,C^A0N,38,36^FD${fusoStr}^FS
^FO${ox+4},${oy+136}^GB${W},2,2^FS
^FO${ox+4},${oy+142}^FB${W/2},1,0,C^A0N,16,15^FDLote: ${loteStr}^FS
^FO${ox+4+W/2},${oy+142}^FB${W/2},1,0,C^A0N,16,15^FD${dataFmt}^FS`
}

// 6 etiquetas: 3 linhas × 2 colunas
export function buildZPLDuplo(rec1, rec2, config = {}, totalFusos = 99999) {
  const { vel = 3, dens = 15, offx = 0 } = config
  const H = 236  // altura de cada etiqueta em dots (30mm)

  // rec1 = fusos ímpares (coluna esquerda), rec2 = fusos pares (coluna direita)
  // linha 0: fuso N e N+1
  // linha 1: fuso N+2 e N+3  (incrementa 2 a cada linha)
  const f1 = Number(rec1.fuso)
  const f2 = Number(rec2.fuso)

  // Só imprime etiquetas para fusos dentro do total — os demais ficam em branco
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
${bloco(rec1, f1,   0,   0  )}
${bloco(rec2, f2,   393, 0  )}
${bloco(rec1, f1+2, 0,   H  )}
${bloco(rec2, f2+2, 393, H  )}
${bloco(rec1, f1+4, 0,   H*2)}
${bloco(rec2, f2+4, 393, H*2)}
^PQ1,0,1,Y
^XZ`
}

// Gera o ZPL completo do ciclo — 6 etiquetas por bloco (3 linhas × 2 colunas)
// Ordem INVERSA: imprime do maior fuso para o menor
// Último a ser impresso = fuso 1-6 (fica no topo do rolo ao desenrolar)
// Exemplo para 72 fusos:
//   1º arquivo impresso: fusos 67,68 / 69,70 / 71,72
//   2º arquivo impresso: fusos 61,62 / 63,64 / 65,66
//   ...
//   12º arquivo impresso: fusos 1,2 / 3,4 / 5,6
export function buildZPLCiclo(baseRecord, config, totalFusos) {
  const zpls = []
  const totalBlocos = Math.ceil(totalFusos / 6)

  // Ordem INVERSA: último bloco primeiro
  // Ex 72 fusos: 67-72, 61-66, ..., 1-6
  // Ex 40 fusos: 37-40(parcial), 31-36, ..., 1-6
  for (let bloco = totalBlocos; bloco >= 1; bloco--) {
    const fusoInicio = (bloco - 1) * 6 + 1

    // Clamp: não ultrapassa o total de fusos
    // Se fuso não existe, repete o último válido (etiqueta em branco não desperdiça papel)
    const f = (n) => Math.min(n, totalFusos)

    const zpl = buildZPLDuplo(
      { ...baseRecord, fuso: f(fusoInicio) },
      { ...baseRecord, fuso: f(fusoInicio + 1) },
      config,
      totalFusos  // passa o total para marcar fusos inválidos como vazio
    )
    zpls.push(zpl)
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
