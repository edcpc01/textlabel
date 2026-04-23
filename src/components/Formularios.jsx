// src/components/Formularios.jsx
import React from 'react'

export function gerarEImprimirFormularios(dados) {
  if (!dados) return;

  const valCiclo = dados.ciclo || dados.maqCiclo || 0
  const maqCiclo = String(valCiclo).padStart(3, '0')
  const maquina = dados.maquina || 'MAQ'
  const lote    = dados.lote || 'LOTE'
  const desc    = dados.descricao || dados.titulo || ''
  const emp     = dados.empresa || 'TECELAGEM SÃO JOÃO'
  const imp     = dados.impressoraRede || ''
  const fusos   = dados.totalFusos || 120

  const torcao = (() => {
    const match = (desc || '').match(/\b(SO|SZ|S\/Z|Z\/S|S|Z)\b/i)
    return match ? match[1].toUpperCase() : ''
  })()

  // Gerador de tabela de fusos (Modelo 2)
  const metade = Math.ceil(fusos / 2)
  const renderFusoRow = (i) => {
    const fusoNum = i + 1;
    if (fusoNum > fusos) return '<tr class="inativo"><td>-</td><td></td><td></td></tr>';
    return `<tr><td>${fusoNum}</td><td></td><td></td></tr>`;
  };

  const rowsCol1 = Array.from({ length: 48 }, (_, i) => renderFusoRow(i)).join('');
  const rowsCol2 = Array.from({ length: 48 }, (_, i) => renderFusoRow(i + 48)).join('');

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${maqCiclo}`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4 portrait; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; }
  body { font-family: 'Arial Narrow', Arial, sans-serif; background: #fff; color: #000; }
  
  .page { width: 210mm; height: 297mm; padding: 12mm 14mm; page-break-after: always; display: flex; flex-direction: column; position: relative; overflow: hidden; }
  
  /* ESTILOS MODELO 1 (ETIQUETA) */
  .titulo-f1 { text-align: center; border-bottom: 3px solid #000; padding-bottom: 4mm; margin-bottom: 5mm; }
  .titulo-f1 h1 { font-size: 32pt; font-weight: 900; text-transform: uppercase; }
  .campo { border: 1.5px solid #000; padding: 2.5mm 4mm; margin-bottom: 4mm; }
  .campo label { font-size: 7pt; font-weight: 700; text-transform: uppercase; color: #555; display: block; margin-bottom: 1.5mm; }
  .campo .v { font-size: 13pt; font-weight: 700; min-height: 7mm; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4mm; }
  .ciclo-box { border: 3px solid #000; padding: 5mm 6mm; display: flex; justify-content: space-between; align-items: center; margin-bottom: 4mm; }
  .ciclo-box .num { font-size: 52pt; font-weight: 900; line-height: 1; }
  .checklist { border: 1.5px solid #000; margin-bottom: 4mm; }
  .checklist-header { background: #333; color: #fff; font-size: 8.5pt; font-weight: 700; padding: 2mm 4mm; text-transform: uppercase; }
  .checklist-body { display: grid; grid-template-columns: repeat(5, 1fr); }
  .check-item { padding: 2mm 3mm; border-right: 1px solid #000; border-bottom: 1px solid #000; }
  .check-item label { font-size: 7pt; font-weight: 700; display: block; margin-bottom: 2mm; }
  .check-linha { border-bottom: 1px solid #ccc; height: 6mm; }
  
  /* ESTILOS MODELO 2 (CLASSIFICAÇÃO) */
  .cab-f2 { display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 1mm; margin-bottom: 2mm; }
  .f2-titulo { font-size: 10pt; font-weight: 900; text-transform: uppercase; text-align: center; flex: 1; }
  .dados-f2 { display: grid; grid-template-columns: 1fr 2fr 1fr 1fr; border: 1px solid #000; margin-bottom: 2mm; }
  .cel-f2 { border-right: 1px solid #000; padding: 1mm 2mm; }
  .cel-f2 label { font-size: 5.5pt; font-weight: 700; display: block; }
  .cel-f2 .v { font-size: 8pt; font-weight: 700; }
  .tabela-fusos { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm; flex: 1; }
  table.fusos { width: 100%; border-collapse: collapse; }
  table.fusos th { background: #222; color: #fff; font-size: 7pt; padding: 1mm; border: 1px solid #000; }
  table.fusos td { border: 1px solid #000; padding: 0 1.5mm; height: 4.8mm; text-align: center; font-size: 8pt; }
  .rodape-f2 { display: grid; grid-template-columns: repeat(6, 1fr); border: 1px solid #000; margin-top: 2mm; }
  .rd-item { border-right: 1px solid #000; padding: 1mm; font-size: 6pt; }
  
  /* MODELO VERSO (DEFEITOS) */
  .grade { border: 1.5px solid #000; display: grid; grid-template-columns: repeat(4, 1fr); flex: 1; }
  .cat { border-right: 1.5px solid #000; border-bottom: 1.5px solid #000; display: flex; flex-direction: column; }
  .cat-tit { font-size: 8pt; font-weight: 700; text-align: center; padding: 1.5mm; background: #f9f9f9; border-bottom: 1px solid #000; }
  .celulas { display: grid; grid-template-columns: repeat(4, 1fr); flex: 1; }
  .cel-def { border-right: 1px dashed #ccc; border-bottom: 1px dashed #ccc; min-height: 10mm; }

  @media print { .page { page-break-after: always; } .no-print { display: none; } }
</style>
</head>
<body>

<!-- PÁGINA 1: ETIQUETA OFICIAL (MODELO 1) -->
<div class="page">
  <div class="titulo-f1"><h1>Texturizadora</h1><h2>Etiqueta de Ciclo de Produção</h2></div>
  <div class="grid2">
    <div class="campo"><label>Material</label><div class="v">${emp}</div></div>
    <div class="campo"><label>Lote</label><div class="v">${lote}</div></div>
  </div>
  <div class="campo"><label>Descrição do Material</label><div class="v">${desc}</div></div>
  <div class="ciclo-box">
    <div><div class="label">Ciclo:</div><div class="num">${maqCiclo}</div></div>
    <img src="${qrUrl}" width="100">
  </div>
  <div class="grid3">
    <div class="campo"><label>Máquina</label><div class="v">${maquina}</div></div>
    <div class="campo"><label>Turno</label><div class="v">&nbsp;</div></div>
    <div class="campo"><label>Data / Hora Ciclo</label><div class="v">&nbsp;</div></div>
  </div>
  <div class="grid3">
    <div class="campo"><label>Responsável</label><div class="v">&nbsp;</div></div>
    <div class="campo"><label>QTDE Bobinas</label><div class="v">&nbsp;</div></div>
    <div class="campo"><label>Peso Bruto</label><div class="v">&nbsp;</div></div>
  </div>
  <div class="checklist">
    <div class="checklist-header">Controle de Processo</div>
    <div class="checklist-body">
      ${Array.from({length:10}).map((_, i) => `
        <div class="check-item"><label>${['Máquina','Aspira Fio','Confec. Jersey','Batocagem','Liberação AFT','Data','Hora','Escolha','Resp.','Resp.'][i]}</label><div class="check-linha"></div></div>
      `).join('')}
    </div>
  </div>
  <div class="grid3" style="margin-top:auto">
    <div class="campo"><label>Jersey</label><div style="border-top:1px solid #000;margin-top:10mm;font-size:7pt">Assinatura</div></div>
    <div class="campo"><label>Destino</label><div style="border-top:1px solid #000;margin-top:10mm;font-size:7pt">Assinatura</div></div>
    <div class="campo"><label>Liberação</label><div style="border-top:1px solid #000;margin-top:10mm;font-size:7pt">Assinatura</div></div>
  </div>
</div>

<!-- PÁGINA 2: VERSO EM BRANCO -->
<div class="page" style="justify-content:center; align-items:center; color:#ccc; font-style:italic;">
  <p>(verso em branco para separação de folhas)</p>
</div>

<!-- PÁGINA 3: CLASSIFICAÇÃO VISUAL (MODELO 2) -->
<div class="page">
  <div class="cab-f2">
    <div style="font-weight:900; font-size:12pt;">RHODIA</div>
    <div class="f2-titulo">Classificação Visual de Afinidade Tintorial</div>
  </div>
  <div class="dados-f2">
    <div class="cel-f2"><label>Maquina</label><div class="v">${maquina}</div></div>
    <div class="cel-f2"><label>Título</label><div class="v">${desc}</div></div>
    <div class="cel-f2"><label>Torção</label><div class="v">${torcao}</div></div>
    <div class="cel-f2" style="border:none;"><label>Lote</label><div class="v">${lote}</div></div>
  </div>
  <div class="tabela-fusos">
    <table class="fusos"><thead><tr><th>FUSO</th><th>BARRA</th><th>TMT</th></tr></thead><tbody>${rowsCol1}</tbody></table>
    <table class="fusos"><thead><tr><th>FUSO</th><th>BARRA</th><th>TMT</th></tr></thead><tbody>${rowsCol2}</tbody></table>
  </div>
  <div class="rodape-f2">
    <div class="rd-item"><label>Máq. Jersey</label></div><div class="rd-item"><label>Nº Bobinas</label></div>
    <div class="rd-item"><label>Jersey - Resp</label></div><div class="rd-item"><label>Tingimento - Resp</label></div>
    <div class="rd-item"><label>Conferente - Resp</label></div><div class="rd-item" style="border:none;"><label>Liberação - Resp</label></div>
  </div>
  <div style="border:1px solid #000; border-top:none; padding:2mm; font-size:7pt; font-weight:700;">
    DIRECIONAMENTO PARA ESCOLHA/EMBALAGEM: _________________________________________________
  </div>
</div>

<!-- PÁGINA 4: DEFEITOS (MODELO 2 VERSO) -->
<div class="page">
  <div style="text-align:center; font-size:16pt; font-weight:900; margin-bottom:4mm;">DEFEITOS DE ESCOLHA VISUAL</div>
  <div class="grade">
    ${['Bobinas com Pêlo','Bobinas Suja','Tubete Amassado','Sem Entrelaçamento','Defeito de Enrolamento','Torção Errada','Tubete Errado','Fio Trançado','Bobinas com 01 Cabo','Bobinas sem Reserva','Bobinas com TMT','Fio Podre','Bobinas com Anel','Bobinas Batidas'].map(n => `
      <div class="cat"><div class="cat-tit">${n}</div><div class="celulas">${Array(16).fill('<div class="cel-def"></div>').join('')}</div></div>
    `).join('')}
    <div class="cat" style="grid-column: span 2; background:#f5f5f5; justify-content:center; align-items:center; font-weight:bold; font-size:10pt; text-align:center; padding:5mm;">
      MARCAR NOS CAMPOS ACIMA O NÚMERO DA BOBINA COM DEFEITO.
    </div>
  </div>
  <table style="width:100%; border-collapse:collapse; margin-top:5mm;">
    <tr><th style="border:1px solid #000; padding:2mm; font-size:8pt;">Etapa</th><th style="border:1px solid #000; padding:2mm; font-size:8pt;">Data</th><th style="border:1px solid #000; padding:2mm; font-size:8pt;">Turno</th><th style="border:1px solid #000; padding:2mm; font-size:8pt;">Responsável</th></tr>
    <tr><td style="border:1px solid #000; padding:4mm; font-size:9pt;">Batocagem</td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td></tr>
    <tr><td style="border:1px solid #000; padding:4mm; font-size:9pt;">Escolha</td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td></tr>
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
