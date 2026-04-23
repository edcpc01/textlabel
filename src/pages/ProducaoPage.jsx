// src/pages/ProducaoPage.jsx
import { useState, useEffect } from 'react'
import { Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  onProdutos, onMaquinas,
  emitirCiclo, getCicloAtualLoteMaq, getEmpresa, getLayout, auth,
  getImpressoraNilit, getOrCreateOperadorCode, getLayoutNilit, getProximoCicloNilitLoteMaq,
} from '../lib/firebase'
import { LAYOUT_DEFAULT, LAYOUT_NILIT_DEFAULT, buildZPLCiclo, buildZPLNilitCiclo, printZPL } from '../lib/zpl'
import { gerarEImprimirFormularios } from '../components/Formularios'
import { LabelPreview } from '../components/LabelPreview'

const EMPTY = {
  produto: '', maquina: '', lote: '',
  data: new Date().toISOString().split('T')[0],
  composicao: '', descricao: '', titulo: '', empresa: '', cnpj: '',
  opacidade: '',
  po: '', lv: 'A',
}

export function ProducaoPage() {
  const [form, setForm]                 = useState(EMPTY)
  const [produtos, setProdutos]         = useState([])
  const [maquinas, setMaquinas]         = useState([])
  const [cicloPreview, setCicloPreview] = useState(null)
  const [lvPreviewNilit, setLvPreviewNilit] = useState('A')
  const [ultimoFormulario, setUltimoFormulario] = useState(null)
  const [configImpressora, setConfigImpressora] = useState({})
  const [configNilit, setConfigNilit]   = useState({ vel: 3, dens: 15, offx: 0 })
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
    if (form.lote && form.maquina) {
      if (isNilit) {
        getProximoCicloNilitLoteMaq(form.lote, form.maquina).then(({ ciclo, lv }) => {
          setCicloPreview(ciclo)
          setLvPreviewNilit(lv)
        })
      } else {
        getCicloAtualLoteMaq(form.lote, form.maquina).then(setCicloPreview)
      }
    } else {
      setCicloPreview(null)
      setLvPreviewNilit('A')
    }
  }, [form.lote, form.maquina, isNilit])

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
    }))
  }

  const maqObj     = maquinas.find(m => m.cod === form.maquina)
  const totalFusos = parseInt(maqObj?.fusos) || 0

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
    if (isNilit && !form.po) erros.push('Ordem de Produção (PO)')
    if (erros.length) { toast.error(`Obrigatório: ${erros.join(', ')}`); return }

    setLoading(true)
    try {
      const user = auth.currentUser
      const emissaoHora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      const { ciclo, lv: lvEmitido, totalFusos: nFusos, barcodes } = await emitirCiclo({
        ...form,
        operador:     operadorCode,
        maquinaFusos: totalFusos,
        empresaNome:  form.empresa || 'EMPRESA',
        userEmail:    user?.email       || '',
        userName:     user?.displayName || user?.email || '',
        emissaoHora,
      })

      let zplAll
      if (isNilit) {
        zplAll = buildZPLNilitCiclo({ ...form, ciclo, lv: lvEmitido, emissaoHora, operador: operadorCode }, zplConfigNilit, barcodes, nFusos, layoutNilit)
      } else {
        zplAll = buildZPLCiclo({ ...form, ciclo }, zplConfig, nFusos, layout)
      }

      const filename = `C${String(ciclo).padStart(3,'0')}_${form.maquina}_${form.lote}.zpl`
      await printZPL(zplAll, filename)

      if (!isNilit) {
        const dadosFormulario = {
          maquina:    form.maquina,
          lote:       form.lote,
          ciclo,
          descricao:  form.descricao,
          composicao: form.composicao,
          titulo:     form.titulo,
          empresa:    form.empresa,
          cnpj:       form.cnpj,
          data:       form.data,
          totalFusos: nFusos,
          impressoraRede: configImpressora.impressoraRede,
        }
        setUltimoFormulario(dadosFormulario)
        gerarEImprimirFormularios(dadosFormulario)
        toast('Se o formulário não baixar, use "Reimprimir Formulário" ou libere múltiplos downloads para este site.', { icon: 'ℹ️' })
      }

      if (isNilit) {
        const prox = await getProximoCicloNilitLoteMaq(form.lote, form.maquina)
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
            {form.maquina || '—'}{totalFusos ? ` / ${totalFusos}` : ''}
          </div>
          <div className="stat-sub">
            {totalFusos ? `${totalFusos} etiquetas por ciclo` : 'cadastre fusos na máquina'}
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
                  {' '}→ {totalFusos} etiquetas
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
                  ✦ Este ciclo irá gerar <strong style={{ color: 'var(--accent)' }}>{totalFusos} etiquetas</strong> —
                  uma para cada fuso da {form.maquina} (posições 1 a {totalFusos})
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={emitir} disabled={loading}>
                  <Printer size={15} />
                  {loading ? 'Emitindo...' : `Emitir Ciclo${totalFusos ? ` (${totalFusos} etiquetas)` : ''}`}
                </button>
                {!isNilit && !!ultimoFormulario && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      gerarEImprimirFormularios(ultimoFormulario)
                      toast.success('Formulário reenviado para download.')
                    }}
                  >
                    Reimprimir Formulário
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
              <LabelPreview record={{ ...form, fuso: 1, ciclo: cicloPreview || 1 }} layout={layout} isNilit={isNilit} layoutNilit={layoutNilit} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
