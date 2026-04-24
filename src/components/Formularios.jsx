// src/components/Formularios.jsx
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function gerarEImprimirFormularios(dados) {
  if (!dados) return

  const valCiclo = Number(dados.ciclo || 0)
  const cicloStr = String(valCiclo).padStart(3, '0')
  const maquina = dados.maquina || ''
  const lote = dados.lote || ''
  const desc = dados.descricao || dados.titulo || ''
  const emp = dados.empresa || ''
  const imp = dados.impressoraRede || ''
  const fusos = Number(dados.totalFusos) || 96
  const maqCiclo = `${maquina}${String(valCiclo).padStart(5, '0')}`

  const torcao = (() => {
    const match = (desc || '').match(/\b(SO|SZ|S\/Z|Z\/S|S|Z)\b/i)
    return match ? match[1].toUpperCase() : ''
  })()

  const renderFusoRows = (start, count) => {
    return Array.from({ length: count }, (_, i) => {
      const fusoNum = start + i
      const isAtivo = fusoNum <= fusos
      return `<tr class="${isAtivo ? 'ativo' : 'inativo'}" data-fuso="${fusoNum}"><td>${fusoNum}</td><td></td><td></td></tr>`
    }).join('')
  }

  const qrData = encodeURIComponent(maqCiclo)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`
  const defeitos = [
    'Bobinas com Pêlo', 'Bobinas Suja', 'Tubete Amassado', 'Sem Entrelaçamento',
    'Defeito de Enrolamento', 'Torção Errada', 'Tubete Errado', 'Fio Trançado',
    'Bobinas com 01 Cabo', 'Bobinas sem Reserva', 'Bobinas com TMT', 'Fio Podre',
  ]

  const css = `
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Arial Narrow',Arial,sans-serif; }
    .page { width:210mm; height:297mm; overflow:hidden; display:flex; flex-direction:column; background:#fff; font-family:'Arial Narrow',Arial,sans-serif; color:#000; }
    .f1 { display:flex; flex-direction:column; gap:5mm; flex:1; padding:12mm 14mm; }
    .titulo { text-align:center; border-bottom:3px solid #000; padding-bottom:3mm; }
    .titulo h1 { font-size:32pt; font-weight:900; text-transform:uppercase; letter-spacing:2px; }
    .titulo h2 { font-size:12pt; font-weight:400; letter-spacing:3px; text-transform:uppercase; margin-top:1mm; }
    .campo { border:1.5px solid #000; padding:2mm 3mm; }
    .campo label { font-size:7pt; font-weight:700; text-transform:uppercase; color:#555; display:block; margin-bottom:1.5mm; }
    .campo .v { font-size:13pt; font-weight:700; min-height:7mm; }
    .campo .v.lg { font-size:16pt; }
    .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:4mm; }
    .grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:4mm; }
    .ciclo-box { border:3px solid #000; padding:5mm 6mm; display:flex; justify-content:space-between; align-items:center; }
    .ciclo-box .num { font-size:52pt; font-weight:900; letter-spacing:1px; line-height:1; }
    .ciclo-box .lbl { font-size:10pt; font-weight:700; margin-bottom:2mm; }
    .qr-area { display:flex; flex-direction:column; align-items:center; gap:1mm; }
    .qr-area img { width:32mm; height:32mm; }
    .qr-area span { font-size:6.5pt; color:#555; }
    .checklist { border:1.5px solid #000; }
    .cl-header { background:#333; color:#fff; font-size:8.5pt; font-weight:700; text-transform:uppercase; padding:2mm 4mm; }
    .cl-body { display:grid; grid-template-columns:repeat(5,1fr); }
    .cl-item { padding:2mm 3mm; border-right:1px solid #000; }
    .cl-item:last-child { border-right:none; }
    .cl-item label { font-size:7pt; font-weight:700; display:block; margin-bottom:2mm; }
    .cl-linha { border-bottom:1px solid #ccc; height:6mm; margin-bottom:2mm; }
    .cl-row2 { border-top:1px solid #000; }
    .cl-span2 { grid-column:span 2; border-right:none; }
    .assinaturas { display:grid; grid-template-columns:repeat(3,1fr); gap:4mm; margin-top:auto; }
    .assin { border:1.5px solid #000; padding:2.5mm 4mm; }
    .assin label { font-size:7pt; font-weight:700; text-transform:uppercase; display:block; margin-bottom:12mm; }
    .assin-linha { border-top:1px solid #000; font-size:7pt; padding-top:1mm; color:#555; }
    .page-branca { display:flex; align-items:center; justify-content:center; color:#ccc; font-size:9pt; font-style:italic; }
    .f2 { display:flex; flex-direction:column; gap:1.2mm; flex:1; padding:3mm 5mm; }
    .f2-cab { display:flex; align-items:center; border-bottom:2px solid #000; padding-bottom:1mm; gap:3mm; }
    .f2-logo { font-size:14pt; font-weight:900; font-style:italic; color:#cc0000; min-width:38mm; }
    .f2-logo span { font-size:6.5pt; display:block; color:#666; font-style:normal; font-weight:400; }
    .f2-titulo { font-size:9pt; font-weight:900; text-transform:uppercase; text-align:center; flex:1; letter-spacing:.2px; }
    .dados-box { display:grid; gap:0; border:1px solid #000; }
    .dl1 { grid-template-columns:1fr 2fr 1fr 1fr; }
    .dl2 { grid-template-columns:1fr 1fr; border-top:none; margin-top:-1px; }
    .cel { border-right:1px solid #000; padding:.5mm 2mm; display:flex; flex-direction:column; }
    .cel:last-child { border-right:none; }
    .cel label { font-size:5pt; font-weight:700; color:#444; }
    .cel .cv { font-size:7.5pt; font-weight:700; min-height:3.5mm; }
    .cel .cv.lg { font-size:9pt; }
    .tabela-fusos { display:grid; grid-template-columns:1fr 1fr; gap:2mm; flex:1; }
    table.fusos { width:100%; border-collapse:collapse; }
    table.fusos th { background:#222; color:#fff; padding:.8mm 1.5mm; text-align:center; border:1px solid #000; font-size:7pt; font-weight:700; }
    table.fusos td { border:1px solid #000; padding:0 1.5mm; height:4.6mm; text-align:center; vertical-align:middle; font-size:7.5pt; }
    table.fusos td:first-child { font-weight:700; background:#f5f5f5; width:11mm; }
    table.fusos tr.inativo td { background:#f0f0f0; color:#ccc; }
    .rodape { display:grid; grid-template-columns:40px 44px 1fr 1fr 1fr 1fr; gap:0; border:1px solid #000; }
    .rd { border-right:1px solid #000; padding:1mm 1.5mm; }
    .rd:last-child { border-right:none; }
    .rd label { font-size:5.5pt; font-weight:700; display:block; text-transform:uppercase; }
    .rd .resp { font-size:6pt; min-height:5.5mm; }
    .rd .dl { font-size:5.5pt; color:#555; border-top:1px solid #ccc; padding-top:.3mm; margin-top:.3mm; }
    .dir { border:1px solid #000; padding:1mm 2mm; }
    .dir .dh { display:flex; gap:8mm; font-size:7pt; font-weight:700; margin-bottom:1mm; }
    .obs { border-bottom:1px solid #ccc; height:4mm; }
    .titulo-verso { text-align:center; font-size:16pt; font-weight:900; text-transform:uppercase; margin-bottom:4mm; }
    .grade { border:1.5px solid #000; display:grid; grid-template-columns:repeat(4,1fr); flex:1; }
    .cat { border-right:1.5px solid #000; border-bottom:1.5px solid #000; display:flex; flex-direction:column; }
    .cat:nth-child(4n) { border-right:none; }
    .cat.ultima { border-bottom:none; }
    .cat-tit { font-size:8pt; font-weight:700; text-transform:uppercase; text-align:center; padding:2mm; border-bottom:1px solid #000; background:#fafafa; }
    .celulas { display:grid; grid-template-columns:repeat(4,1fr); flex:1; }
    .cel-def { border-right:1px dashed #ccc; border-bottom:1px dashed #ccc; min-height:9mm; }
    .cel-def:nth-child(4n) { border-right:none; }
    .instrucao { display:flex; align-items:center; justify-content:center; text-align:center; font-size:9pt; font-weight:700; padding:4mm; line-height:1.6; background:#f5f5f5; }
    .tab-rod { width:100%; border-collapse:collapse; margin-top:5mm; }
    .tab-rod th { border:1px solid #000; padding:2.5mm 3mm; font-size:9pt; font-weight:700; background:#fafafa; text-align:center; }
    .tab-rod td { border:1px solid #000; padding:2.5mm 3mm; font-size:10pt; font-weight:700; min-height:11mm; vertical-align:middle; }
    .rod-info { margin-top:4mm; font-size:7.5pt; font-style:italic; color:#666; }
  `

  const pagesHtml = `
<!-- PAGINA 1: FORMULARIO 1 -->
<div class="page">
  <div class="f1">
    <div class="titulo">
      <h1>Texturizadora</h1>
      <h2>Etiqueta de Ciclo de Produção</h2>
    </div>
    <div class="grid2">
      <div class="campo"><label>Material</label><div class="v">${emp}</div></div>
      <div class="campo"><label>Lote</label><div class="v">${lote}</div></div>
    </div>
    <div class="campo"><label>Descrição do Material</label><div class="v lg">${desc}</div></div>
    <div class="ciclo-box">
      <div>
        <div class="lbl">Ciclo:</div>
        <div class="num">${cicloStr}</div>
      </div>
      <div class="qr-area">
        <img src="${qrUrl}" alt="QR ${maqCiclo}" crossorigin="anonymous" />
        <span>${maqCiclo}</span>
      </div>
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
      <div class="cl-header">Controle de Processo</div>
      <div class="cl-body">
        <div class="cl-item"><label>Máquina</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item"><label>Aspira Fio</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item"><label>Confec. Jersey</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item"><label>Batocagem</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item"><label>Liberação AFT</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item cl-row2"><label>Data</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item cl-row2"><label>Hora</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item cl-row2"><label>Escolha</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item cl-row2 cl-span2"><label>Responsável</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
      </div>
    </div>
    <div class="assinaturas">
      <div class="assin"><label>Jersey</label><div class="assin-linha">Assinatura</div></div>
      <div class="assin"><label>Destino</label><div class="assin-linha">Assinatura</div></div>
      <div class="assin"><label>Liberação</label><div class="assin-linha">Assinatura</div></div>
    </div>
  </div>
</div>

<!-- PAGINA 2: VERSO FORMULARIO 1 (EM BRANCO) -->
<div class="page page-branca"><p>(verso em branco)</p></div>

<!-- PAGINA 3: FORMULARIO 2 CLASSIFICACAO -->
<div class="page">
  <div class="f2">
    <div class="f2-cab">
      <div class="f2-logo">Doptex<span>Poliamida América do Sul</span></div>
      <div class="f2-titulo">Classificação Visual de Afinidade Tintorial</div>
    </div>
    <div class="dados-box dl1">
      <div class="cel"><label>Maquina</label><div class="cv">${maquina}</div></div>
      <div class="cel"><label>Título</label><div class="cv lg">${desc}</div></div>
      <div class="cel"><label>Torção</label><div class="cv">${torcao}</div></div>
      <div class="cel"><label>Lote</label><div class="cv">${lote}</div></div>
    </div>
    <div class="dados-box dl2">
      <div class="cel"><label>DataHoraCiclo</label><div class="cv">&nbsp;</div></div>
      <div class="cel"><label>Obs.</label><div class="cv">&nbsp;</div></div>
    </div>
    <div class="tabela-fusos">
      <table class="fusos"><thead><tr><th>FUSO</th><th>BARRA</th><th>TMT</th></tr></thead><tbody>${renderFusoRows(1, 48)}</tbody></table>
      <table class="fusos"><thead><tr><th>FUSO</th><th>BARRA</th><th>TMT</th></tr></thead><tbody>${renderFusoRows(49, 48)}</tbody></table>
    </div>
    <div class="rodape">
      <div class="rd"><label>Máq. Jersey</label><div class="resp">&nbsp;</div></div>
      <div class="rd"><label>Nº Bobinas</label><div class="resp">&nbsp;</div></div>
      <div class="rd"><label>Jersey — Responsável</label><div class="resp">&nbsp;</div><div class="dl">Data:</div></div>
      <div class="rd"><label>Tingimento — Responsável</label><div class="resp">&nbsp;</div><div class="dl">Data:</div></div>
      <div class="rd"><label>Conferente — Responsável</label><div class="resp">&nbsp;</div><div class="dl">Data:</div></div>
      <div class="rd"><label>Liberação — Responsável</label><div class="resp">&nbsp;</div><div class="dl">Data:</div></div>
    </div>
    <div class="dir">
      <div class="dh">
        <span>DIRECIONAMENTO PARA ESCOLHA/EMBALAGEM</span>
        <span>LIDER RESP.: ___________________________</span>
      </div>
      <div class="obs"></div>
      <div class="obs"></div>
    </div>
  </div>
</div>

<!-- PAGINA 4: DEFEITOS DE ESCOLHA VISUAL -->
<div class="page">
  <div class="f2">
    <div class="titulo-verso">Defeitos de Escolha Visual</div>
    <div class="grade">
      ${defeitos.map(nome => `
        <div class="cat">
          <div class="cat-tit">${nome}</div>
          <div class="celulas">${Array(16).fill('<div class="cel-def"></div>').join('')}</div>
        </div>
      `).join('')}
      <div class="cat ultima"><div class="cat-tit">Bobinas com Anel</div><div class="celulas">${Array(16).fill('<div class="cel-def"></div>').join('')}</div></div>
      <div class="cat ultima"><div class="cat-tit">Bobinas Batidas</div><div class="celulas">${Array(16).fill('<div class="cel-def"></div>').join('')}</div></div>
      <div class="cat ultima"><div class="cat-tit">&nbsp;</div><div class="celulas">${Array(16).fill('<div class="cel-def"></div>').join('')}</div></div>
      <div class="cat ultima" style="border-right:none;">
        <div class="instrucao">MARCAR NOS CAMPOS<br>NÚMERO DA BOBINA<br>COM DEFEITO.</div>
      </div>
    </div>
    <table class="tab-rod">
      <thead>
        <tr>
          <th style="width:28mm;"></th>
          <th style="width:38mm;">Data</th>
          <th style="width:42mm;">Turma</th>
          <th>Responsável</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Batocagem</td><td></td><td></td><td></td></tr>
        <tr><td>Escolha</td><td></td><td></td><td></td></tr>
      </tbody>
    </table>
    <div class="rod-info">Qualidade\\padronização\\tietê\\formulários\\FO 02 038- Defeitos de Escolha Visual (folha verso)</div>
  </div>
</div>
`

  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-10000px;top:0;z-index:-1;background:#fff;'
  container.innerHTML = `<style>${css}</style>${pagesHtml}`
  document.body.appendChild(container)

  try {
    const img = container.querySelector('img[alt^="QR"]')
    await new Promise(res => {
      if (!img || img.complete) return setTimeout(res, 200)
      img.onload = res
      img.onerror = res
      setTimeout(res, 5000)
    })

    const pages = container.querySelectorAll('.page')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
      })
      if (i > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297)
    }

    const timestamp = Date.now()
    const sfx = imp ? `__${imp.replace(/[^a-zA-Z0-9\-_]/g, '_')}` : ''
    const filename = `F${cicloStr}_${maquina}_${lote}_${timestamp}${sfx}.pdf`
    pdf.save(filename)
  } finally {
    document.body.removeChild(container)
  }
}
