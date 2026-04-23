// src/components/Formularios.jsx
import React from 'react'

export function gerarEImprimirFormularios(dados) {
  // Blindagem: se dados for nulo, evita erro
  if (!dados) return;

  // Tenta pegar o ciclo de 'ciclo' ou 'maqCiclo'
  const valCiclo = dados.ciclo || dados.maqCiclo || 0
  const maqCiclo = String(valCiclo).padStart(3, '0')
  
  const maquina = dados.maquina || 'MAQ'
  const lote    = dados.lote || 'LOTE'
  const desc    = dados.descricao || dados.titulo || ''
  const emp     = dados.empresa || 'TECELAGEM SÃO JOÃO'
  const imp     = dados.impressoraRede || ''
  const fusos   = dados.totalFusos || 120

  // Torção extraída da descrição
  const torcao = (() => {
    const match = (desc || '').match(/\b(SO|SZ|S\/Z|Z\/S|S|Z)\b/i)
    return match ? match[1].toUpperCase() : ''
  })()

  // Fusos
  const metade = Math.ceil(fusos / 2)
  const rowsFuso1 = Array.from({ length: metade }, (_, i) =>
    `<tr><td>${i+1}</td><td></td><td></td></tr>`
  ).join('')
  const rowsFuso2 = Array.from({ length: fusos - metade }, (_, i) =>
    `<tr><td>${metade+i+1}</td><td></td><td></td></tr>`
  ).join('')

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${maqCiclo}`

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 0; size: auto; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 10pt; }
  .pagina { width: 210mm; height: 297mm; padding: 15mm; page-break-after: always; }
  .landscape { width: 297mm; height: 210mm; padding: 10mm; page-break-before: always; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
  td, th { border: 1.5px solid #000; padding: 2mm; vertical-align: top; }
  .label { font-size: 7pt; font-weight: bold; text-transform: uppercase; }
  .valor { font-size: 11pt; font-weight: bold; }
  .titulo-f1 { text-align: center; border-bottom: 3px solid #000; margin-bottom: 5mm; }
  .ciclo-area { border: 3px solid #000; padding: 5mm; margin-bottom: 4mm; }
  .grid-defeitos td { height: 11mm; font-size: 7pt; border: 1px solid #000; }
  .cat-header { background: #eee; font-weight: bold; text-align: center; }
</style>
</head>
<body>
<div class="pagina">
  <div class="titulo-f1"><h1>TEXTURIZADORA</h1><p>ETIQUETA DE CICLO DE PRODUÇÃO</p></div>
  <table>
    <tr><td colspan="2"><span class="label">Material</span><div class="valor">${emp}</div></td></tr>
    <tr><td width="50%"><span class="label">Lote</span><div class="valor">${lote}</div></td><td width="50%"><span class="label">Descrição</span><div class="valor">${desc}</div></td></tr>
  </table>
  <div class="ciclo-area">
    <table border="0" style="border:none;">
      <tr>
        <td style="border:none;"><span class="label">Ciclo</span><div style="font-size: 36pt; font-weight: 900;">${maqCiclo}</div></td>
        <td style="border:none; text-align:right;"><img src="${qrUrl}" width="100"></td>
      </tr>
    </table>
  </div>
  <table>
    <tr><td><span class="label">Máquina</span><div class="valor">${maquina}</div></td><td><span class="label">Turno</span></td><td><span class="label">Data/Hora Ciclo</span></td></tr>
  </table>
</div>
<div class="pagina"></div>
<div class="pagina">
  <div style="text-align:center; margin-bottom:5mm;"><h2>Mapa de Defeitos de Escolha</h2></div>
  <table class="grid-defeitos">
    ${['BOBINAS COM PELO','BOBINAS SUJA','TUBETE AMASSADO','SEM ENTRELAÇAMENTO','DEFEITO ENROLAMENTO','TORÇÃO ERRADA','TUBETE ERRADO','FIO TRANÇADO','FIO PODRE','BOBINAS COM TMT'].map(cat => `
      <tr><td class="cat-header" colspan="4">${cat}</td></tr>
      <tr><td></td><td></td><td></td><td></td></tr>
    `).join('')}
  </table>
</div>
<div class="pagina landscape">
  <table><tr><td style="border:none; font-size:18pt; font-weight:bold;">RHODIA</td><td style="border:none; text-align:center; font-size:14pt; font-weight:bold;">CLASSIFICAÇÃO VISUAL</td></tr></table>
  <table><tr><td><span class="label">Máquina</span><div class="valor">${maquina}</div></td><td><span class="label">Título</span><div class="valor">${desc}</div></td><td><span class="label">Torção</span><div class="valor">${torcao}</div></td><td><span class="label">Lote</span><div class="valor">${lote}</div></td></tr></table>
  <table style="font-size:8pt;">
    <tr><th>FUSO</th><th>BARRA</th><th>TMT</th><th>FUSO</th><th>BARRA</th><th>TMT</th></tr>
    ${Array.from({ length: metade }).map((_, i) => `<tr><td>${i+1}</td><td></td><td></td><td>${metade+i+1 > fusos ? '-' : metade+i+1}</td><td></td><td></td></tr>`).join('')}
  </table>
</div>
<script>window.onload = () => { setTimeout(() => window.print(), 500); }</script>
</body>
</html>`

  const timestamp = Date.now()
  const sfx = imp ? `__${imp.replace(/[^a-zA-Z0-9\-_]/g, '_')}` : ''
  const filename = `F${maqCiclo}_${maquina}_${lote}_${timestamp}${sfx}.htm`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500)
}
