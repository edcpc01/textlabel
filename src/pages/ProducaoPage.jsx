// src/pages/ProducaoPage.jsx
import { useState, useEffect } from 'react'
import { Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  onProdutos, onMaquinas,
  emitirCiclo, getCicloAtualLoteMaq, getEmpresa, getLayout, auth,
  getImpressoraNilit, getOrCreateOperadorCode, getLayoutNilit, getProximoCicloNilitLoteMaq,
} from '../lib/firebase'
import { LAYOUT_DEFAULT, LAYOUT_NILIT_DEFAULT, buildZPLCiclo, buildZPLNilitCiclo, printZPL, computeLabelGroups } from '../lib/zpl'
import { gerarEImprimirFormularios } from '../components/Formularios'
import { LabelPreview } from '../components/LabelPreview'

const EMPTY = {
  produto: '', maquina: '', lote: '',
  data: new Date().toISOString().split('T')[0],
  composicao: '', descricao: '', titulo: '', empresa: '', cnpj: '',
  opacidade: '', cabos: '',
  po: '', lv: 'A',
}

const RPR_DESC = 'RPR TEXTRIZADORA CONV. SINGLE'

export function ProducaoPage() {
  const [form, setForm]                 = useState(EMPTY)
  const [produtos, setProdutos]         = useState([])
  const [maquinas, setMaquinas]         = useState([])
  const [cicloPreview, setCicloPreview] = useState(null)
  const [lvPreviewNilit, setLvPreviewNilit] = useState('A')
  const [ultimosFormularios, setUltimosFormularios] = useState([])
  const [configImpressora, setConfigImpressora] = useState({})
  const [configNilit, setConfigNilit]   = useState({ vel: 2, dens: 30, offx: 0 })
  const [operadorCode, setOperadorCode] = useState('0000')
  const [loading, setLoading]           = useState(false)
  const [layout, setLayoutData]         = useState(LAYOUT_DEFAULT)
  const [layoutNilit, setLayoutNilit]   = useState(LAYOUT_NILIT_DEFAULT)
  const isNilit = (form.empresa || '').toLowerCase().includes('nilit')

  useEffect(() => {
    const u1 = onProdutos(setProdutos)
    const u2 = onMaquinas(setMaquinas)
    getEmpresa().then(setConfigImpressora)
    getImpressoraNilit().then(setConfigNilit)
    getLayout().then(setLayoutData)
    getLayoutNilit().then(setLayoutNilit)
    const user = auth.currentUser
    if (user) {
      getOrCreateOperadorCode(user).then(code => {
        setOperadorCode(String(code).padStart(4, '0'))
      })
    }
    return () => { u1(); u2() }
  }, [])

  useEffect(() => {
    if (form.lote && form.maquina && form.produto) {
      if (isNilit) {
        getProximoCicloNilitLoteMaq(form.lote, form.maquina, form.produto).then(({ ciclo, lv }) => {
          setCicloPreview(ciclo)
          setLvPreviewNilit(lv)
        })
      } else {
        getCicloAtualLoteMaq(form.lote, form.maquina, form.produto).then(setCicloPreview)
      }
    } else {
      setCicloPreview(null)
      setLvPreviewNilit('A')
    }
  }, [form.lote, form.maquina, form.produto, isNilit])

  function handleProdChange(cod) {
    const prod = produtos.find(p => p.cod === cod)
    setForm(f => ({
      ...f,
      produto:    cod,
      descricao:  prod?.desc      || f.descricao,
      composicao: prod?.comp      || f.composicao,
      titulo:     prod?.titulo    || f.titulo,
      empresa:    prod?.empresa   || f.empresa,
      cnpj:       prod?.cnpj      || f.cnpj,
      opacidade:  prod?.opacidade || f.opacidade,
      cabos:      ['1','2','3'].includes(prod?.cabos) ? prod.cabos : '',
    }))
  }

  const maqObj      = maquinas.find(m => m.cod === form.maquina)
  const totalFusos  = parseInt(maqObj?.fusos) || 0

  // Torção só se aplica em máquinas RPR TEXTRIZADORA CONV. SINGLE
  const isRPR = (maqObj?.desc || '').toUpperCase().includes(RPR_DESC)
  const cabos = form.cabos || ''
  const effectiveCabos = isRPR && ['1','2','3'].includes(cabos) ? cabos : ''

  const labelGroups    = totalFusos > 0 ? computeLabelGroups(effectiveCabos, totalFusos, form.descricao) : []
  const effectiveFusos = labelGroups.reduce((s, g) => s + g.count, 0)

  function getLabelInfoText() {
    if (!form.maquina || !totalFusos) return null
    switch (effectiveCabos) {
      case '1': {
        const half = Math.floor(totalFusos / 2)
        return `${effectiveFusos} etiquetas — ${half} torção "S" + ${half} torção "Z" (1 cabo)`
      }
      case '2':
        return `${effectiveFusos} etiquetas — metade dos fusos de ${form.maquina} (2 cabos)`
      case '3': {
        const sixth = Math.floor(totalFusos / 6)
        return `${effectiveFusos} etiquetas — ${sixth} torção "S" + ${sixth} torção "Z" (3 cabos)`
      }
      default:
        return `${effectiveFusos} etiquetas — uma para cada fuso de ${form.maquina} (posições 1 a ${effectiveFusos})`
    }
  }

  const zplConfig = {
    vel:  configImpressora.vel  || 3,
    dens: configImpressora.dens || 15,
    offx: configImpressora.offx ?? -24,
  }

  const zplConfigNilit = {
    vel:  configNilit.vel  || 3,
    dens: configNilit.dens || 15,
    offx: configNilit.offx ?? 0,
  }

  async function emitir() {
    const erros = []
    if (!form.produto)    erros.push('Produto')
    if (!form.maquina)    erros.push('Máquina')
    if (!form.lote)       erros.push('Lote / Ordem')
    if (!form.data)       erros.push('Data')
    if (!form.composicao) erros.push('Composição')
    if (!form.descricao)  erros.push('Descrição')
    if (!totalFusos)      erros.push('Máquina sem Nº de Fusos cadastrado')
    if (!effectiveFusos)  erros.push('Nº de fusos insuficiente para a qtde. de cabos selecionada')
    if (isNilit && !form.po) erros.push('Ordem de Produção (PO)')
    if (erros.length) { toast.error(`Obrigatório: ${erros.join(', ')}`); return }

    setLoading(true)
    try {
      const user = auth.currentUser
      const emissaoHora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      const { ciclo, lv: lvEmitido, totalFusos: nFusos, barcodes } = await emitirCiclo({
        ...form,
        cabos: effectiveCabos,
        operador:     operadorCode,
        maquinaFusos: totalFusos,
        empresaNome:  form.empresa || 'EMPRESA',
        userEmail:    user?.email       || '',
        userName:     user?.displayName || user?.email || '',
        emissaoHora,
      })

      // Monta entradas por fuso com descrição correta (torção "S"/"Z" quando aplicável)
      let labelEntries = null
      if (effectiveCabos) {
        const groups = computeLabelGroups(effectiveCabos, totalFusos, form.descricao)
        labelEntries = []
        let fusoNum = 1
        for (const group of groups) {
          for (let i = 0; i < group.count; i++) {
            labelEntries.push({ ...form, ciclo, fuso: fusoNum++, descricao: group.descricao })
          }
        }
      }

      let zplAll
      if (isNilit) {
        zplAll = buildZPLNilitCiclo({ ...form, ciclo, lv: lvEmitido, emissaoHora, operador: operadorCode }, zplConfigNilit, barcodes, nFusos, layoutNilit, labelEntries)
      } else {
        zplAll = buildZPLCiclo({ ...form, ciclo }, zplConfig, nFusos, layout, labelEntries)
      }

      const filename = `C${String(ciclo).padStart(3,'0')}_${form.maquina}_${form.lote}.zpl`
      await printZPL(zplAll, filename)

      if (!isNilit) {
        const baseFormulario = {
          maquina:    form.maquina,
          lote:       form.lote,
          ciclo,
          composicao: form.composicao,
          titulo:     form.titulo,
          empresa:    form.empresa,
          cnpj:       form.cnpj,
          data:       form.data,
          impressoraRede: configImpressora.impressoraRede,
        }

        // Para 1 ou 3 cabos em máquina RPR: gera um kit PDF por grupo (S e Z)
        const hasTorcaoGroups = ['1','3'].includes(effectiveCabos)
        let formularios
        if (hasTorcaoGroups) {
          const groups = computeLabelGroups(effectiveCabos, totalFusos, form.descricao)
          formularios = groups.map(g => ({ ...baseFormulario, descricao: g.descricao, totalFusos: g.count }))
        } else {
          formularios = [{ ...baseFormulario, descricao: form.descricao, totalFusos: nFusos }]
        }

        setUltimosFormularios(formularios)
        // Gera PDFs em sequência para evitar conflito de download
        formularios.reduce(
          (p, f) => p.then(() => gerarEImprimirFormularios(f)),
          Promise.resolve()
        ).catch(err => toast.error('Erro ao gerar PDF: ' + err.message))

        toast(
          hasTorcaoGroups
            ? `Gerando ${formularios.length} PDFs de formulário ("S" e "Z")…`
            : 'Gerando PDF do formulário…',
          { icon: '📄' }
        )
      }

      if (isNilit) {
        const prox = await getProximoCicloNilitLoteMaq(form.lote, form.maquina, form.produto)
        setCicloPreview(prox.ciclo)
        setLvPreviewNilit(prox.lv)
      } else {
        setCicloPreview(ciclo + 1)
      }
      const sufixoNilit = isNilit ? ` · LV ${lvEmitido}` : ''
      toast.success(`✓ Ciclo ${String(ciclo).padStart(3,'0')}${sufixoNilit} — ${nFusos} etiquetas (${form.maquina} / ${form.lote})`)
    } catch (err) {
      toast.error('Erro ao emitir: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Dashboard <span>Produção</span></h1>
        <p className="page-subtitle">Emissão de ciclos — cada ciclo gera uma etiqueta por fuso automaticamente</p>
      </div>

      {/* STATS */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Próximo Ciclo</div>
          <div className="stat-value accent">
            {cicloPreview ? String(cicloPreview).padStart(3, '0') : '—'}
          </div>
          <div className="stat-sub">
            {form.lote && form.maquina ? `${form.maquina} / ${form.lote}` : 'selecione lote e máquina'}
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Produto</div>
          <div className="stat-value" style={{ fontSize: '1.1rem', paddingTop: '.3rem' }}>
            {form.produto || '—'}
          </div>
          <div className="stat-sub">{form.descricao?.slice(0, 30) || 'nenhum selecionado'}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Lote / Ordem</div>
          <div className="stat-value" style={{ fontSize: '1.1rem', paddingTop: '.3rem' }}>
            {form.lote || '—'}
          </div>
        </div>
        <div className="stat-card" style={{ borderTopColor: 'var(--yellow)' }}>
          <div className="stat-label">Máquina / Fusos</div>
          <div className="stat-value" style={{ fontSize: '1.1rem', paddingTop: '.3rem', color: 'var(--yellow)' }}>
            {form.maquina || '—'}{effectiveFusos ? ` / ${effectiveFusos}` : ''}
          </div>
          <div className="stat-sub">
            {!totalFusos
              ? 'cadastre fusos na máquina'
              : effectiveCabos === '1'
                ? `${Math.floor(totalFusos/2)} "S" · ${Math.floor(totalFusos/2)} "Z"`
                : effectiveCabos === '3'
                  ? `${Math.floor(totalFusos/6)} "S" · ${Math.floor(totalFusos/6)} "Z"`
                  : `${effectiveFusos} etiquetas por ciclo`}
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL — 2 colunas assimétricas */}
      <div className="two-col">

        {/* COLUNA ESQUERDA — Formulário */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">DADOS DO CICLO</span>
              {cicloPreview && form.maquina && form.lote && (
                <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
                  Ciclo <strong style={{ color: 'var(--accent)' }}>{String(cicloPreview).padStart(3,'0')}</strong>
                  {isNilit ? (
                    <> · LV <strong style={{ color: 'var(--accent)' }}>{lvPreviewNilit}</strong></>
                  ) : null}
                  {' '}→ {effectiveFusos} etiquetas
                </span>
              )}
            </div>
            <div className="card-body">
              <div className="form-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                <div className="form-group">
                  <label className="form-label">Máquina</label>
                  <select className="form-control" value={form.maquina}
                    onChange={e => setForm(f => ({ ...f, maquina: e.target.value }))}>
                    <option value="">— Selecione —</option>
                    {maquinas.map(m => (
                      <option key={m.id} value={m.cod}>
                        {m.cod} — {m.desc} ({m.fusos} fusos)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lote / Ordem de Produção</label>
                  <input className="form-control" type="text" placeholder="Ex: 5846"
                    value={form.lote} onChange={e => setForm(f => ({ ...f, lote: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Produto / Fio</label>
                  <select className="form-control" value={form.produto}
                    onChange={e => handleProdChange(e.target.value)}>
                    <option value="">— Selecione —</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.cod}>{p.cod} — {p.desc}</option>
                    ))}
                  </select>
                </div>
                {isNilit && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Ordem de Produção <span style={{ color: 'var(--accent)', fontSize: '.75em' }}>Nilit</span></label>
                      <input className="form-control" type="text" placeholder="Ex: 620680"
                        value={form.po} onChange={e => setForm(f => ({ ...f, po: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Carga LV <span style={{ color: 'var(--accent)', fontSize: '.75em' }}>automática</span></label>
                      <input className="form-control" type="text" readOnly value={lvPreviewNilit}
                        style={{ color: 'var(--text)', cursor: 'default' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Operador</label>
                      <input className="form-control" readOnly value={operadorCode}
                        style={{ color: 'var(--muted)', cursor: 'default' }} />
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label className="form-label">Data de Fabricação</label>
                  <input className="form-control" type="date"
                    value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Composição</label>
                  <input className="form-control" type="text" placeholder="100% PES"
                    value={form.composicao} onChange={e => setForm(f => ({ ...f, composicao: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Título (Dtex)</label>
                  <input className="form-control" type="text" placeholder="230"
                    value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Descrição do Produto</label>
                  <input className="form-control" type="text"
                    placeholder="FIO PES TEXT. A AR SO 2X100/96DTEX CRU"
                    value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
                </div>
              </div>

              {form.maquina && totalFusos > 0 && (
                <div style={{
                  marginTop: 16, padding: '10px 14px', borderRadius: 4,
                  background: 'rgba(0,212,255,.07)', border: '1px solid rgba(0,212,255,.2)',
                  fontSize: '.78rem', color: 'var(--text2)', lineHeight: 1.7,
                }}>
                  ✦ Este ciclo irá gerar <strong style={{ color: 'var(--accent)' }}>{effectiveFusos} etiquetas</strong> — {getLabelInfoText()?.replace(/^\d+ etiquetas — /, '')}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={emitir} disabled={loading}>
                  <Printer size={15} />
                  {loading ? 'Emitindo...' : `Emitir Ciclo${effectiveFusos ? ` (${effectiveFusos} etiquetas)` : ''}`}
                </button>
                {!isNilit && ultimosFormularios.length > 0 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      ultimosFormularios.reduce(
                        (p, f) => p.then(() => gerarEImprimirFormularios(f)),
                        Promise.resolve()
                      )
                      toast.success(
                        ultimosFormularios.length > 1
                          ? `${ultimosFormularios.length} formulários reenviados.`
                          : 'Formulário reenviado para download.'
                      )
                    }}
                  >
                    Reimprimir Formulário{ultimosFormularios.length > 1 ? ` (${ultimosFormularios.length})` : ''}
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => setForm(EMPTY)}>Limpar</button>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA — Preview */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <span className="card-title">PREVIEW — FUSO 1</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <LabelPreview
                record={{
                  ...form,
                  fuso: 1,
                  ciclo: cicloPreview || 1,
                  descricao: labelGroups[0]?.descricao ?? form.descricao,
                }}
                layout={layout} isNilit={isNilit} layoutNilit={layoutNilit}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
