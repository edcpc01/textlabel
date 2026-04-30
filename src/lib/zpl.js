// src/lib/zpl.js
// Zebra ZT230 — 200dpi — 50×30mm — 2 colunas × 3 linhas
// H=236 dots | Papel total=786 dots (2×393)

export const LAYOUT_DEFAULT = {
  fontEmpresa: '20,20',
  fontCnpj: '18,18',
  fontDesc: '24,24',
  fontComp: '24,24',
  fontLabel: '10,9',
  fontMaq: '22,20',
  fontCiclo: '22,20',
  fontFuso: '30,30',
  fontLote: '30,30',
  colMaq: 135,
  colCiclo: 95,
  margemX: 14,   // margem lateral base (ajustável)
  margemTop: 8,
  espacamento: 2,
}

function parseFont(s) {
  const parts = String(s).split(',')
  const h = Number(parts[0]) || 16
  const w = Number(parts[1]) || 14
  const bold = parts[2] === 'B'
  return { h, w, bold }
}

function renderField(x, y, w, f, text, center = 'C') {
  const cmd = `^A0N,${f.h},${f.w}`
  const fb = `^FB${w},1,0,${center}`

  let res = `^FO${x},${y}${fb}${cmd}^FD${text}^FS`
  if (f.bold) {
    // SUPER NEGRITO 2X (Matriz 2x2 com salto de 2 dots para boa espessura sem borrar)
    for (let dx = 0; dx <= 2; dx += 2) {
      for (let dy = 0; dy <= 2; dy += 2) {
        if (dx === 0 && dy === 0) continue
        res += `^FO${x + dx},${y + dy}${fb}${cmd}^FD${text}^FS`
      }
    }
  }
  return res
}

// ox=0 → coluna esquerda | ox=393 → coluna direita
function blocoEtiqueta(record, ox, oy, L) {
  const cicloStr = String(record.ciclo || 1).padStart(2, '0')
  const dataFmt = record.data ? record.data.split('-').reverse().join('/') : ''
  const compTit = [record.composicao, record.titulo ? `${record.titulo}TEX` : '']
    .filter(Boolean).join(' - ')

  const emp = (record.empresa || '').slice(0, 34)
  const cnpjStr = record.cnpj ? `CNPJ: ${record.cnpj}` : ''
  const desc = (record.descricao || '').slice(0, 32)
  const comp = compTit.slice(0, 32)
  const maq = String(record.maquina || '').slice(0, 10)
  const loteStr = String(record.lote || '').slice(0, 14)
  const fusoStr = String(record.fuso || '')

  const fEmp = parseFont(L.fontEmpresa)
  const fCnpj = parseFont(L.fontCnpj)
  const fDesc = parseFont(L.fontDesc)
  const fComp = parseFont(L.fontComp)
  const fLbl = parseFont(L.fontLabel)
  const fMaq = parseFont(L.fontMaq)
  const fFuso = parseFont(L.fontFuso)
  const fLote = parseFont(L.fontLote)

  const sp = Number(L.espacamento) || 2
  const mT = Number(L.margemTop) || 8
  const mX = Number(L.margemX) || 14

  // ── Margens independentes por coluna ──
  // Coluna esquerda (ox=0): precisa de margem maior à ESQUERDA
  // Coluna direita (ox=393): precisa de margem maior à DIREITA
  // Isso compensa o offset físico da impressora em cada lado
  const isLeft = ox === 0
  const mLeft = isLeft ? mX + 6 : mX      // col esq tem +6 dots à esquerda
  const mRight = isLeft ? mX : mX + 24 // col dir tem +24 dots à direita

  const W = 393 - mLeft - mRight  // largura do texto (~351 dots)
  const xL = ox + mLeft            // início do texto

  // Colunas Máq/Ciclo/Fuso proporcionais a W
  const colF = W - L.colMaq - L.colCiclo
  const xC1 = xL
  const xC2 = xL + L.colMaq
  const xC3 = xL + L.colMaq + L.colCiclo

  // ── Y dinâmico ──
  let y = oy + mT

  const y1 = y; y += fEmp.h + sp
  const ySep1 = y; y += 3 + sp
  const y2 = y; y += fCnpj.h + sp
  const y3 = y; y += fDesc.h + sp
  const y4 = y; y += fComp.h + sp + 1
  const ySep2 = y; y += 3 + sp
  const yLbl = y; y += fLbl.h + 1
  const hVal = Math.max(fMaq.h, fFuso.h)
  const yVal = y; y += hVal + sp
  const ySep3 = y; y += 3 + sp
  const H_ETQ = 236
  const yLote = Math.min(y, oy + H_ETQ - fLote.h - 4)

  return `
${renderField(xL, y1, W, fEmp, emp)}
${renderField(xL, y2, W, fCnpj, cnpjStr)}
${renderField(xL, y3, W, fDesc, desc)}
${renderField(xL, y4, W, fComp, comp)}
${renderField(xC1, yLbl, L.colMaq, fLbl, 'Maquina')}
${renderField(xC2, yLbl, L.colCiclo, fLbl, 'Ciclo')}
${renderField(xC3, yLbl, colF, fLbl, 'Fuso')}
${renderField(xC1, yVal, L.colMaq, fMaq, maq)}
${renderField(xC2, yVal, L.colCiclo, fMaq, cicloStr)}
${renderField(xC3, yVal, colF, fFuso, fusoStr)}
${renderField(xL, yLote, Math.floor(W / 2), fLote, `Lote: ${loteStr}`)}
${renderField(xL + Math.floor(W / 2), yLote, Math.ceil(W / 2), fLote, dataFmt)}`
}

export function buildZPL(record, config = {}, layout = {}) {
  const L = { ...LAYOUT_DEFAULT, ...layout }
  return buildZPLDuplo({ ...record }, { ...record, fuso: Number(record.fuso) + 1 }, config, 99999, L)
}

export function buildZPLDuplo(rec1, rec2, config = {}, totalFusos = 99999, layout = {}) {
  const L = { ...LAYOUT_DEFAULT, ...layout }
  const { vel = 3, dens = 15, offx = -24 } = config
  const lshift = offx  // offset físico da ZT230
  const H = 236
  const f1 = Number(rec1.fuso)
  const f2 = Number(rec2.fuso)
  const b = (rec, fuso, ox, oy) =>
    fuso <= totalFusos ? blocoEtiqueta({ ...rec, fuso }, ox, oy, L) : ''

  return `^XA
^MMT
^PW786
^LL${H * 3}
^LS${lshift}
^LT0
^PR${vel},${vel}
~SD${dens}
^CI28
${b(rec1, f1, 0, 0)}
${b(rec2, f2, 393, 0)}
${b(rec1, f1 + 2, 0, H)}
${b(rec2, f2 + 2, 393, H)}
${b(rec1, f1 + 4, 0, H * 2)}
${b(rec2, f2 + 4, 393, H * 2)}
^PQ1,0,1,Y
^XZ`
}

// Calcula grupos de etiquetas por cabo (1, 2 ou 3)
// Só deve ser chamada para máquinas RPR TEXTRIZADORA CONV. SINGLE
export function computeLabelGroups(cabos, totalFusos, descricao) {
  const half  = Math.floor(totalFusos / 2)
  const sixth = Math.floor(totalFusos / 6)
  switch (String(cabos)) {
    case '1': return [
      { count: half,        descricao: (descricao || '') + ' "S"', torcao: 'S' },
      { count: half,        descricao: (descricao || '') + ' "Z"', torcao: 'Z' },
    ]
    case '2': return [
      { count: half,        descricao: descricao || '' },
    ]
    case '3': return [
      { count: sixth,       descricao: (descricao || '') + ' "S"', torcao: 'S' },
      { count: sixth,       descricao: (descricao || '') + ' "Z"', torcao: 'Z' },
    ]
    default:  return [
      { count: totalFusos,  descricao: descricao || '' },
    ]
  }
}

// labelEntries: array de { ...record, fuso, descricao } — quando omitido usa comportamento padrão
export function buildZPLCiclo(baseRecord, config, totalFusos, layout = {}, labelEntries = null) {
  const L = { ...LAYOUT_DEFAULT, ...layout }
  const { vel = 3, dens = 15, offx = -24 } = config
  const H = 236

  const entries = labelEntries ||
    Array.from({ length: totalFusos }, (_, i) => ({ ...baseRecord, fuso: i + 1 }))

  const total       = entries.length
  const totalBlocos = Math.ceil(total / 6)
  const zpls        = []

  const slot = (idx, ox, oy) => {
    const e = entries[idx]
    return e ? blocoEtiqueta(e, ox, oy, L) : ''
  }

  for (let bloco = totalBlocos; bloco >= 1; bloco--) {
    const fi = (bloco - 1) * 6
    zpls.push(`^XA
^MMT
^PW786
^LL${H * 3}
^LS${offx}
^LT0
^PR${vel},${vel}
~SD${dens}
^CI28
${slot(fi,     0,   0)}
${slot(fi + 1, 393, 0)}
${slot(fi + 2, 0,   H)}
${slot(fi + 3, 393, H)}
${slot(fi + 4, 0,   H * 2)}
${slot(fi + 5, 393, H * 2)}
^PQ1,0,1,Y
^XZ`)
  }
  return zpls.join('\n')
}

export function downloadZPL(content, filename) {
  const safeName = (filename || `etiqueta_${Date.now()}.zpl`).replace('.zpl', '.txt')
  const blob = new Blob([content], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = safeName; a.style.display = 'none'
  document.body.appendChild(a); a.click()
  setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a) }, 500)
}

export async function printZPL(content, filename) {
  downloadZPL(content, filename); return 'download'
}

// ─── NILIT — 64×35mm — 1 coluna — 200dpi ──────────────
// Width: 504 dots | Height: 276 dots

export const LAYOUT_NILIT_DEFAULT = {
  fontCode:    '44,38',  // Linha 1 esq — código (FD04066)
  fontDate:    '22,18',  // Linha 1 dir — data e hora
  fontOp:      '16,13',  // Linha 1 dir — operador 6200xxxx (bloco data)
  fontL2:      '20,14',  // Linha 2 — descrição / máquina / composição
  fontL3:      '20,14',  // Linha 3 — PO / CG / LV / POS
  fontBarcode: '20,16',  // Texto abaixo do barcode
  barcodeHeight: 100,
  barcodeModule: 3,
  barcodeRatio:  3.0,
  margemTop: 8,
  margemX:   8,
}

function lote4d(loteStr) {
  return String(loteStr || '').replace(/\D/g, '').slice(0, 4).padStart(4, '0')
}

export function buildZPLNilit(record, config = {}, layout = {}) {
  const L = { ...LAYOUT_NILIT_DEFAULT, ...layout }
  const { vel = 2, dens = 30, offx = 0 } = config
  const {
    opacidade = '', maquina = '', lote = '', data = '',
    emissaoHora = '', descricao = '', composicao = '',
    operador = '', po = '', ciclo = 1, lv = 'A',
    fuso = 1, barcode = 'B000000000',
  } = record

  const fCode = parseFont(L.fontCode)
  const fDate = parseFont(L.fontDate)
  const fOp   = fDate
  const fL2   = parseFont(L.fontL2)
  const fL3   = parseFont(L.fontL3)
  const fBc   = parseFont(L.fontBarcode)
  const mT = Number(L.margemTop) || 8
  const mX = Number(L.margemX) || 8
  const bH = Number(L.barcodeHeight) || 100

  // ── Bloco direito: data + hora + operador empilhados
  const yCode = mT
  const yTime = yCode + fDate.h + 2
  const yOp   = yTime + fDate.h + 2

  // Linha 2 começa após o maior entre: fim do código e fim do bloco OP
  const yL2      = Math.max(yCode + fCode.h, yOp + fOp.h) + 3
  const yL3      = yL2 + fL2.h + 2
  const yBarcode = yL3 + fL3.h + 4
  const yBcText  = yBarcode + bH + 4

  const W = 504 - 2 * mX

  let descRaw = String(descricao || '')
  let torcaoStr = ''
  const regex = /(^|\s)"?(S|Z)"?(?=\s|$)/gi
  const matches = [...descRaw.matchAll(regex)]
  if (matches.length > 0) {
    torcaoStr = matches[matches.length - 1][2].toUpperCase()
    descRaw = descRaw.replace(regex, ' ').replace(/\s+/g, ' ').trim()
  }

  const opacity2 = String(opacidade).toUpperCase().slice(0, 2).padEnd(2, ' ')
  const baseCode = `${opacity2}0${lote4d(lote)}`
  const code1   = torcaoStr ? `${baseCode} ${torcaoStr}` : baseCode
  const dateFmt = data ? data.split('-').reverse().join('/') : ''
  const hora    = emissaoHora || ''
  const desc    = descRaw.slice(0, 22)
  const comp    = String(composicao || '').slice(0, 8)
  const maqFull = String(maquina || '').slice(0, 8)
  const op      = String(operador || '').slice(0, 4).padStart(4, '0')
  const opCode  = `6200${op}`
  const cicloStr = String(ciclo)
  const fusoStr  = String(fuso)
  const lvStr    = String(lv || 'A').toUpperCase().slice(0, 1)

  const bR = Number(L.barcodeRatio) || 3.0

  const approxModules = 35 + 11 * String(barcode).length
  const bW = Math.max(1, Math.floor((504 - 2 * mX - 2) / approxModules))
  const bcEnd = mX + bW * approxModules

  let barcodeZPL = ''
  for (let i = 0; i <= 2; i++) {
    barcodeZPL += `^FO${mX + i},${yBarcode}^BY${bW},${bR},${bH}^BCN,${bH},N,N^FD${barcode}^FS\n`
  }

  // Bloco direito (data + hora + op): largura = 10 × fDate.w
  const wRight = 10 * fDate.w
  const xDate  = 504 - mX - wRight - 15
  const wCode  = 400

  // Linha 2: esq = desc + máquina | dir = composição
  // Alinha o final da composição com o final do barcode (evita corte físico)
  const wL2r = 130
  const xL2r = Math.max(mX, bcEnd - wL2r)
  const wL2l = xL2r - mX

  return `^XA
^MMT
^PW504
^LL276
^LS${offx}
^LT0
^PR${vel},${vel}
~SD${dens}
^CI28
${renderField(mX,    yCode, wCode,  fCode, code1,   'L')}
${renderField(xDate, yCode, wRight, fDate, dateFmt, 'C')}
${renderField(xDate, yTime, wRight, fDate, hora,    'C')}
${renderField(xDate, yOp,   wRight, fOp,  opCode,  'C')}
${renderField(mX,    yL2,   wL2l,   fL2,  `${desc} ${maqFull}`, 'L')}
${renderField(xL2r,  yL2,   wL2r,   fL2,  comp,    'R')}
${renderField(mX,    yL3,   W,      fL3,  `PO:${po}  CG:${cicloStr}  LV:${lvStr}  POS:${fusoStr}/1`, 'L')}
${barcodeZPL}
${renderField(mX, yBcText, W, fBc, barcode, 'C')}
^PQ1,0,1,Y
^XZ`
}

export function buildZPLNilitCiclo(baseRecord, config, barcodes, totalFusos, layout = {}, labelEntries = null) {
  const zpls = []
  for (let fuso = totalFusos; fuso >= 1; fuso--) {
    const entry = labelEntries ? labelEntries[fuso - 1] : null
    zpls.push(buildZPLNilit({
      ...baseRecord,
      ...(entry || {}),
      fuso: entry && entry.fuso ? entry.fuso : fuso,
      barcode: (barcodes && barcodes[fuso - 1]) || 'B000000000',
    }, config, layout))
  }
  return zpls.join('\n')
}
