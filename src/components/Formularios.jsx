// src/components/Formularios.jsx
import React from 'react'

export function gerarEImprimirFormularios(dados) {
  if (!dados) return;

  const valCiclo = dados.ciclo || dados.maqCiclo || 0
  const maqCiclo = String(valCiclo).padStart(3, '0')
  const maquina = dados.maquina || ''
  const lote    = dados.lote || ''
  const desc    = dados.descricao || dados.titulo || ''
  const emp     = dados.empresa || ''
  const imp     = dados.impressoraRede || ''
  const fusos   = dados.totalFusos || 120

  const torcao = (() => {
    const match = (desc || '').match(/\b(SO|SZ|S\/Z|Z\/S|S|Z)\b/i)
    return match ? match[1].toUpperCase() : ''
  })()

  // Gerador de tabela de fusos (IDÊNTICO AO MODELO 2)
  const renderFusoRows = (start, count) => {
    return Array.from({ length: count }, (_, i) => {
      const fusoNum = start + i;
      const isAtivo = fusoNum <= fusos;
      return `<tr class="${isAtivo ? 'ativo' : 'inativo'}"><td>${fusoNum}</td><td></td><td></td></tr>`;
    }).join('');
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${maqCiclo}`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  /* RESET GERAL */
  @page { size: A4 portrait; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'Arial Narrow', Arial, sans-serif; background: #fff; }

  /* CONTAINER DE PÁGINA */
  .page { width: 210mm; height: 297mm; background: #fff; page-break-after: always; position: relative; overflow: hidden; }

  /* ESTILOS MODELO 1 */
  .f1-container { padding: 12mm 14mm; display: flex; flex-direction: column; gap: 5mm; height: 100%; }
  .f1-titulo { text-align: center; border-bottom: 3px solid #000; padding-bottom: 4mm; }
  .f1-titulo h1 { font-size: 32pt; font-weight: 900; text-transform: uppercase; }
  .f1-titulo h2 { font-size: 12pt; font-weight: 400; text-transform: uppercase; margin-top: 1mm; }
  .f1-campo { border: 1.5px solid #000; padding: 2.5mm 4mm; }
  .f1-campo label { font-size: 7pt; font-weight: 700; text-transform: uppercase; color: #555; display: block; margin-bottom: 1.5mm; }
  .f1-campo .v { font-size: 13pt; font-weight: 700; min-height: 7mm; }
  .f1-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
  .f1-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4mm; }
  .f1-ciclo-box { border: 3px solid #000; padding: 5mm 6mm; display: flex; justify-content: space-between; align-items: center; }
  .f1-ciclo-box .num { font-size: 52pt; font-weight: 900; line-height: 1; }
  .f1-checklist { border: 1.5px solid #000; }
  .f1-checklist-header { background: #333; color: #fff; font-size: 8.5pt; font-weight: 700; text-transform: uppercase; padding: 2mm 4mm; }
  .f1-checklist-body { display: grid; grid-template-columns: repeat(5, 1fr); }
  .f1-check-item { padding: 2mm 3mm; border-right: 1px solid #000; }
  .f1-check-item label { font-size: 7pt; font-weight: 700; display: block; margin-bottom: 2mm; }
  .f1-check-linha { border-bottom: 1px solid #ccc; height: 6mm; margin-bottom: 2mm; }
  .f1-assinaturas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-top: auto; }
  .f1-assin-item { border: 1.5px solid #000; padding: 2.5mm 4mm; }
  .f1-assin-item label { font-size: 7pt; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 12mm; }
  .f1-assin-linha { border-top: 1px solid #000; font-size: 7pt; padding-top: 1mm; color: #555; }

  /* ESTILOS MODELO 2 */
  .f2-container { padding: 3mm 5mm; display: flex; flex-direction: column; gap: 1.2mm; height: 100%; }
  .f2-cab { display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 1mm; gap: 3mm; }
  .f2-titulo-form { font-size: 9pt; font-weight: 900; text-transform: uppercase; text-align: center; flex: 1; }
  .f2-dados-box { display: grid; border: 1px solid #000; }
  .f2-dl1 { grid-template-columns: 1fr 2fr 1fr 1fr; }
  .f2-dl2 { grid-template-columns: 1fr 1fr; border-top: none; margin-top: -1px; }
  .f2-cel { border-right: 1px solid #000; padding: .5mm 2mm; display: flex; flex-direction: column; }
  .f2-cel label { font-size: 5pt; font-weight: 700; color: #444; }
  .f2-cel .v { font-size: 7.5pt; font-weight: 700; min-height: 3.5mm; }
  .f2-tabela-fusos { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm; flex: 1; }
  table.fusos { width: 100%; border-collapse: collapse; }
  table.fusos th { background: #222; color: #fff; padding: .8mm 1.5mm; text-align: center; border: 1px solid #000; font-size: 7pt; }
  table.fusos td { border: 1px solid #000; padding: 0 1.5mm; height: 4.6mm; text-align: center; font-size: 7.5pt; }
  table.fusos tr.inativo td { color: #ccc; background: #fafafa; }
  .f2-rodape { display: grid; grid-template-columns: 40px 44px 1fr 1fr 1fr 1fr; border: 1px solid #000; margin-top: 1mm; }
  .f2-rd { border-right: 1px solid #000; padding: 1mm 1.5mm; }
  .f2-rd label { font-size: 5.5pt; font-weight: 700; display: block; text-transform: uppercase; }
  .f2-rd .resp { font-size: 6pt; min-height: 5.5mm; }
  .f2-dir { border: 1px solid #000; padding: 1mm 2mm; margin-top: 1mm; }
  .f2-dir .dh { display: flex; gap: 8mm; font-size: 7pt; font-weight: 700; }
  
  /* MODELO 2 VERSO (DEFEITOS) */
  .f2v-titulo { text-align: center; font-size: 16pt; font-weight: 900; text-transform: uppercase; margin-bottom: 4mm; margin-top: 5mm; }
  .f2v-grade { border: 1.5px solid #000; display: grid; grid-template-columns: repeat(4, 1fr); flex: 1; }
  .f2v-cat { border-right: 1.5px solid #000; border-bottom: 1.5px solid #000; display: flex; flex-direction: column; }
  .f2v-cat-tit { font-size: 8pt; font-weight: 700; text-transform: uppercase; text-align: center; padding: 2mm; background: #fafafa; border-bottom: 1px solid #000; }
  .f2v-celulas { display: grid; grid-template-columns: repeat(4, 1fr); flex: 1; }
  .f2v-cel-def { border-right: 1px dashed #ccc; border-bottom: 1px dashed #ccc; min-height: 9.5mm; }
</style>
</head>
<body>

<!-- PÁGINA 1: MODELO 1 FRENTE -->
<div class="page">
  <div class="f1-container">
    <div class="f1-titulo"><h1>Texturizadora</h1><h2>Etiqueta de Ciclo de Produção</h2></div>
    <div class="f1-grid2">
      <div class="f1-campo"><label>Material</label><div class="v">${emp}</div></div>
      <div class="f1-campo"><label>Lote</label><div class="v">${lote}</div></div>
    </div>
    <div class="f1-campo"><label>Descrição do Material</label><div class="v" style="font-size:16pt;">${desc}</div></div>
    <div class="f1-ciclo-box"><div class="esq"><div class="f1-campo" style="border:none;padding:0"><label>Ciclo:</label><div class="num">${maqCiclo}</div></div></div><img src="${qrUrl}" width="100"></div>
    <div class="f1-grid3">
      <div class="f1-campo"><label>Máquina</label><div class="v">${maquina}</div></div>
      <div class="f1-campo"><label>Turno</label><div class="v">&nbsp;</div></div>
      <div class="f1-campo"><label>Data / Hora Ciclo</label><div class="v">&nbsp;</div></div>
    </div>
    <div class="f1-grid3">
      <div class="f1-campo"><label>Responsável</label><div class="v">&nbsp;</div></div>
      <div class="f1-campo"><label>QTDE Bobinas</label><div class="v">&nbsp;</div></div>
      <div class="f1-campo"><label>Peso Bruto</label><div class="v">&nbsp;</div></div>
    </div>
    <div class="f1-checklist">
      <div class="f1-checklist-header">Controle de Processo</div>
      <div class="f1-checklist-body">
        ${['Máquina','Aspira Fio','Confec. Jersey','Batocagem','Liberação AFT','Data','Hora','Escolha','Resp.','Resp.'].map((l,i) => `
          <div class="f1-check-item" style="${i>=5?'border-top:1px solid #000;':''}${i==4||i==9?'border-right:none;':''}${i==9?'grid-column:span 2;':''}">
            <label>${l}</label><div class="f1-check-linha"></div><div class="f1-check-linha"></div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="f1-assinaturas">
      <div class="f1-assin-item"><label>Jersey</label><div class="f1-assin-linha">Assinatura</div></div>
      <div class="f1-assin-item"><label>Destino</label><div class="f1-assin-linha">Assinatura</div></div>
      <div class="f1-assin-item"><label>Liberação</label><div class="f1-assin-linha">Assinatura</div></div>
    </div>
  </div>
</div>

<!-- PÁGINA 2: MODELO 1 VERSO (BRANCO) -->
<div class="page"><div style="display:flex;align-items:center;justify-content:center;height:100%;color:#eee;font-style:italic;">(verso em branco)</div></div>

<!-- PÁGINA 3: MODELO 2 FRENTE -->
<div class="page">
  <div class="f2-container">
    <div class="f2-cab"><div style="font-weight:900;font-size:12pt">RHODIA</div><div class="f2-titulo-form">Classificação Visual de Afinidade Tintorial</div></div>
    <div class="f2-dados-box f2-dl1">
      <div class="f2-cel"><label>Maquina</label><div class="v">${maquina}</div></div>
      <div class="f2-cel"><label>Título</label><div class="v">${desc}</div></div>
      <div class="f2-cel"><label>Torção</label><div class="v">${torcao}</div></div>
      <div class="f2-cel" style="border:none;"><label>Lote</label><div class="v">${lote}</div></div>
    </div>
    <div class="f2-dados-box f2-dl2">
      <div class="f2-cel"><label>DataHoraCiclo</label><div class="v">&nbsp;</div></div>
      <div class="f2-cel" style="border:none;"><label>Obs.</label><div class="v">&nbsp;</div></div>
    </div>
    <div class="f2-tabela-fusos">
      <table class="fusos"><thead><tr><th>FUSO</th><th>BARRA</th><th>TMT</th></tr></thead><tbody>${renderFusoRows(1, 48)}</tbody></table>
      <table class="fusos"><thead><tr><th>FUSO</th><th>BARRA</th><th>TMT</th></tr></thead><tbody>${renderFusoRows(49, 48)}</tbody></table>
    </div>
    <div class="f2-rodape">
      <div class="f2-rd"><label>Máq</label><div class="resp"></div></div>
      <div class="f2-rd"><label>Bob</label><div class="resp"></div></div>
      <div class="f2-rd"><label>Jersey - Resp</label><div class="resp"></div></div>
      <div class="f2-rd"><label>Ting - Resp</label><div class="resp"></div></div>
      <div class="f2-rd"><label>Conf - Resp</label><div class="resp"></div></div>
      <div class="f2-rd" style="border:none;"><label>Lib - Resp</label><div class="resp"></div></div>
    </div>
    <div class="f2-dir"><div class="f2-dh"><span>DIRECIONAMENTO: ___________________________</span><span>LIDER: _______________</span></div></div>
  </div>
</div>

<!-- PÁGINA 4: MODELO 2 VERSO -->
<div class="page">
  <div class="f2-container">
    <div class="f2v-titulo">Defeitos de Escolha Visual</div>
    <div class="f2v-grade">
      ${['Bobinas com Pêlo','Bobinas Suja','Tubete Amassado','Sem Entrelaçamento','Defeito Enrolamento','Torção Errada','Tubete Errado','Fio Trançado','Bobinas com 01 Cabo','Bobinas sem Reserva','Bobinas com TMT','Fio Podre','Bobinas com Anel','Bobinas Batidas'].map((n,i) => `
        <div class="f2v-cat" style="${i%4==3?'border-right:none;':''}"><div class="f2v-cat-tit">${n}</div><div class="f2v-celulas">${Array(16).fill('<div class="f2v-cel-def"></div>').join('')}</div></div>
      `).join('')}
      <div class="f2v-cat" style="grid-column:span 2;border:none;background:#f5f5f5;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:bold;font-size:9pt;padding:4mm;">
        MARCAR NOS CAMPOS ACIMA O NÚMERO DA BOBINA COM DEFEITO.
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-top:2mm;border:1.5px solid #000">
      <tr><th style="border:1px solid #000;padding:2mm;font-size:8pt">Etapa</th><th style="border:1px solid #000;padding:2mm;font-size:8pt">Data</th><th style="border:1px solid #000;padding:2mm;font-size:8pt">Turma</th><th style="border:1px solid #000;padding:2mm;font-size:8pt">Responsável</th></tr>
      <tr><td style="border:1px solid #000;padding:3mm;font-size:9pt">Batocagem</td><td style="border:1px solid #000"></td><td style="border:1px solid #000"></td><td style="border:1px solid #000"></td></tr>
      <tr><td style="border:1px solid #000;padding:3mm;font-size:9pt">Escolha</td><td style="border:1px solid #000"></td><td style="border:1px solid #000"></td><td style="border:1px solid #000"></td></tr>
    </table>
  </div>
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
