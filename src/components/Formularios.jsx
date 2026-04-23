// src/components/Formularios.jsx
import React from 'react'

export function emitirFormularios(ciclo, empresa, totalFusos, impressoraRede) {
  const { maqCiclo, maquina, lote, descricao } = ciclo
  const cicloStr = maqCiclo || '000000'

  // Torção extraída da descrição
  const torcao = (() => {
    const match = (descricao || '').match(/\b(SO|SZ|S\/Z|Z\/S|S|Z)\b/i)
    return match ? match[1].toUpperCase() : ''
  })()

  // Fusos para formulário 2 — divididos ao meio
  const metade    = Math.ceil(totalFusos / 2)
  const rowsFuso1 = Array.from({ length: metade }, (_, i) =>
    `<tr><td>${i+1}</td><td></td><td></td></tr>`
  ).join('')
  const rowsFuso2 = Array.from({ length: totalFusos - metade }, (_, i) =>
    `<tr><td>${metade+i+1}</td><td></td><td></td></tr>`
  ).join('')

  // QR Code via API pública (sem dependência externa)
  const qrData    = encodeURIComponent(maqCiclo)
  const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Formulários — Ciclo ${maqCiclo}</title>
<style>
  @page { margin: 0; size: auto; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 10pt; background: #fff; color: #000; }
  
  .pagina { 
    width: 210mm; 
    height: 297mm; 
    padding: 15mm; 
    page-break-after: always; 
    overflow: hidden;
  }
  
  .landscape { 
    width: 297mm; 
    height: 210mm; 
    padding: 10mm;
    page-break-before: always;
  }

  table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
  td, th { border: 1.5px solid #000; padding: 2mm; vertical-align: top; }
  .label { font-size: 7pt; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 1mm; }
  .valor { font-size: 11pt; font-weight: bold; }
  .titulo-f1 { text-align: center; border-bottom: 3px solid #000; margin-bottom: 5mm; padding-bottom: 2mm; }
  .titulo-f1 h1 { font-size: 22pt; text-transform: uppercase; }
  
  .ciclo-area { border: 3px solid #000; padding: 5mm; margin-bottom: 4mm; }
  .fuso-tabela td { font-size: 8pt; text-align: center; height: 6mm; }
  .fuso-tabela th { background: #eee; font-size: 7pt; }

  .grid-defeitos { width: 100%; table-layout: fixed; }
  .grid-defeitos td { height: 12mm; font-size: 7pt; border: 1px solid #000; }
  .cat-header { background: #eee; font-weight: bold; text-align: center; font-size: 8pt; padding: 1mm; }
</style>
</head>
<body>

<!-- PÁGINA 1: ETIQUETA (FRENTE) -->
<div class="pagina">
  <div class="titulo-f1">
    <h1>TEXTURIZADORA</h1>
    <p>ETIQUETA DE CICLO DE PRODUÇÃO</p>
  </div>
  <table>
    <tr><td colspan="2"><span class="label">Material</span><div class="valor">${empresa || 'TECELAGEM SÃO JOÃO'}</div></td></tr>
    <tr>
      <td width="50%"><span class="label">Lote</span><div class="valor">${lote}</div></td>
      <td width="50%"><span class="label">Descrição</span><div class="valor">${descricao}</div></td>
    </tr>
  </table>
  <div class="ciclo-area">
    <table border="0" style="border:none; margin:0;">
      <tr style="border:none;">
        <td style="border:none; vertical-align:middle;">
          <span class="label">Ciclo</span>
          <div style="font-size: 36pt; font-weight: 900;">${maqCiclo}</div>
        </td>
        <td style="border:none; text-align:right; vertical-align:middle;">
          <img src="${qrUrl}" width="100">
        </td>
      </tr>
    </table>
  </div>
  <table>
    <tr>
      <td width="33%"><span class="label">Máquina</span><div class="valor">${maquina}</div></td>
      <td width="33%"><span class="label">Turno</span><div class="valor">&nbsp;</div></td>
      <td width="34%"><span class="label">Data/Hora Ciclo</span><div class="valor">&nbsp;</div></td>
    </tr>
  </table>
  <div style="margin-top: 10mm; border-top: 2px solid #000; padding-top: 5mm;">
    <p style="font-size: 8pt; font-weight: bold; margin-bottom: 5mm;">CONTROLE DE PROCESSO / ASSINATURAS</p>
    <table height="80">
      <tr>
        <td width="33%"><span class="label">Máquina</span></td>
        <td width="33%"><span class="label">Aspira Fio</span></td>
        <td width="34%"><span class="label">Responsável</span></td>
      </tr>
    </table>
  </div>
</div>

<!-- PÁGINA 2: BRANCO (Para garantir Sheet 1 = Frente única) -->
<div class="pagina">
  <div style="display:flex; align-items:center; justify-content:center; height:100%; color:#eee; font-style:italic;">
    [Página em branco]
  </div>
</div>

<!-- PÁGINA 3: DEFEITOS (FRENTE DA FOLHA 2) -->
<div class="pagina">
  <div style="text-align:center; margin-bottom:5mm;">
    <h2 style="text-transform:uppercase;">Mapa de Defeitos de Escolha</h2>
  </div>
  <table class="grid-defeitos">
    ${['BOBINAS COM PELO','BOBINAS SUJA','TUBETE AMASSADO','SEM ENTRELAÇAMENTO','DEFEITO ENROLAMENTO','TORÇÃO ERRADA','TUBETE ERRADO','FIO TRANÇADO','FIO PODRE','BOBINAS COM TMT'].map(cat => `
      <tr><td class="cat-header" colspan="4">${cat}</td></tr>
      <tr><td></td><td></td><td></td><td></td></tr>
    `).join('')}
  </table>
</div>

<!-- PÁGINA 4: CLASSIFICAÇÃO (VERSO DA FOLHA 2) -->
<div class="pagina landscape">
  <table style="border:none; margin-bottom:10mm;">
    <tr style="border:none;">
      <td style="border:none; font-size:18pt; font-weight:bold;">RHODIA</td>
      <td style="border:none; text-align:center; font-size:14pt; font-weight:bold;">CLASSIFICAÇÃO VISUAL DE AFINIDADE TINTORIAL</td>
    </tr>
  </table>
  <table>
    <tr>
      <td><span class="label">Máquina</span><div class="valor">${maquina}</div></td>
      <td><span class="label">Título</span><div class="valor">${descricao}</div></td>
      <td><span class="label">Torção</span><div class="valor">${torcao}</div></td>
      <td><span class="label">Lote</span><div class="valor">${lote}</div></td>
    </tr>
  </table>
  <table class="fuso-tabela">
    <tr>
      <th width="10%">FUSO</th><th width="20%">BARRA</th><th width="20%">TMT</th>
      <th width="10%">FUSO</th><th width="20%">BARRA</th><th width="20%">TMT</th>
    </tr>
    ${Array.from({ length: Math.ceil(totalFusos/2) }).map((_, i) => `
      <tr>
        <td>${i+1}</td><td></td><td></td>
        <td>${Math.ceil(totalFusos/2)+i+1 > totalFusos ? '-' : Math.ceil(totalFusos/2)+i+1}</td><td></td><td></td>
      </tr>
    `).join('')}
  </table>
</div>

<script>
  window.onload = () => { setTimeout(() => window.print(), 500); }
</script>
</body>
</html>`

  const timestamp = Date.now()
  const impressoraSufixo = impressoraRede ? `__${impressoraRede.replace(/[^a-zA-Z0-9\-_]/g, '_')}` : ''
  const filename = `F${cicloStr}_${maquina}_${lote}_${timestamp}${impressoraSufixo}.htm`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }, 500)
}
