// src/pages/ProducaoPage.jsx
import { useState, useEffect } from 'react'
import { Printer, Copy, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  onProdutos, onMaquinas,
  emitirCiclo, getCicloAtualLoteMaq, getEmpresa,
} from '../lib/firebase'
import { buildZPLCiclo, buildZPL, printZPL, downloadZPL } from '../lib/zpl'
import { LabelPreview } from '../components/LabelPreview'

const EMPTY = {
  produto: '', maquina: '', lote: '',
  data: new Date().toISOString().split('T')[0],
  composicao: '', descricao: '', titulo: '', empresa: '', cnpj: '',
}

export function ProducaoPage() {
  const [form, setForm]           = useState(EMPTY)
  const [produtos, setProdutos]   = useState([])
  const [maquinas, setMaquinas]   = useState([])
  const [cicloPreview, setCicloPreview] = useState(null)
  const [configImpressora, setConfigImpressora] = useState({})
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    const u1 = onProdutos(setProdutos)
    const u2 = onMaquinas(setMaquinas)
    getEmpresa().then(setConfigImpressora)
    return () => { u1(); u2() }
  }, [])

  // Atualiza preview do ciclo ao mudar lote ou máquina
  useEffect(() => {
    if (form.lote && form.maquina) {
      getCicloAtualLoteMaq(form.lote, form.maquina).then(setCicloPreview)
    } else {
      setCicloPreview(null)
    }
  }, [form.lote, form.maquina])

  // Auto-fill ao selecionar produto (descrição, composição, título, empresa, cnpj)
  function handleProdChange(cod) {
    const prod = produtos.find(p => p.cod === cod)
    setForm(f => ({
      ...f,
      produto:    cod,
      descricao:  prod?.desc    || f.descricao,
      composicao: prod?.comp    || f.composicao,
      titulo:     prod?.titulo  || f.titulo,
      empresa:    prod?.empresa || f.empresa,
      cnpj:       prod?.cnpj    || f.cnpj,
    }))
  }

  function getMaquinaObj() {
    return maquinas.find(m => m.cod === form.maquina)
  }

  const zplConfig = {
    vel:  configImpressora.vel  || 3,
    dens: configImpressora.dens || 15,
    offx: configImpressora.offx || 0,
  }

  const maqObj     = getMaquinaObj()
  const totalFusos = parseInt(maqObj?.fusos) || 0

  const zplPreview = (form.produto && form.lote && form.maquina)
    ? buildZPL({ ...form, fuso: 1, ciclo: cicloPreview || 1 }, zplConfig)
    : ''

  async function emitir() {
    const erros = []
    if (!form.produto)    erros.push('Produto')
    if (!form.maquina)    erros.push('Máquina')
    if (!form.lote)       erros.push('Lote / Ordem')
    if (!form.data)       erros.push('Data')
    if (!form.composicao) erros.push('Composição')
    if (!form.descricao)  erros.push('Descrição')
    if (!totalFusos)      erros.push('Máquina sem Nº de Fusos cadastrado')
    if (erros.length) { toast.error(`Obrigatório: ${erros.join(', ')}`); return }

    setLoading(true)
    try {
      const { ciclo, totalFusos: nFusos } = await emitirCiclo({
        ...form,
        maquinaFusos: totalFusos,
        empresaNome:  form.empresa || 'EMPRESA',
      })

      const zplAll  = buildZPLCiclo({ ...form, ciclo }, zplConfig, nFusos)
      const filename = `C${String(ciclo).padStart(3,'0')}_${form.maquina}_${form.lote}.zpl`
      printZPL(zplAll, filename)

      setCicloPreview(ciclo + 1)
      toast.success(`✓ Ciclo ${String(ciclo).padStart(3,'0')} — ${nFusos} etiquetas (${form.maquina} / ${form.lote})`)
    } catch (err) {
      toast.error('Erro ao emitir: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function copiarZPL() {
    if (!zplPreview) { toast.error('Preencha os dados para gerar o ZPL.'); return }
    navigator.clipboard?.writeText(zplPreview).then(() => toast.success('ZPL copiado!'))
  }

  function baixarZPL() {
    if (!zplPreview) { toast.error('Preencha os dados para gerar o ZPL.'); return }
    downloadZPL(zplPreview, `preview_fuso1_${Date.now()}.zpl`)
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Dashboard <span>Produção</span></h1>
        <p className="page-subtitle">Emissão de ciclos — cada ciclo gera uma etiqueta por fuso automaticamente</p>
      </div>

      {/* STAT CARDS */}
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

      <div className="two-col">
        {/* FORMULÁRIO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">DADOS DO CICLO</span>
              {cicloPreview && form.maquina && form.lote && (
                <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
                  Ciclo <strong style={{ color: 'var(--accent)' }}>{String(cicloPreview).padStart(3,'0')}</strong> → {totalFusos} etiquetas
                </span>
              )}
            </div>
            <div className="card-body">
              <div className="form-grid">

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
                    value={form.lote}
                    onChange={e => setForm(f => ({ ...f, lote: e.target.value }))} />
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

                <div className="form-group">
                  <label className="form-label">Data de Fabricação</label>
                  <input className="form-control" type="date"
                    value={form.data}
                    onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Composição</label>
                  <input className="form-control" type="text" placeholder="100% PES"
                    value={form.composicao}
                    onChange={e => setForm(f => ({ ...f, composicao: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Título (Dtex)</label>
                  <input className="form-control" type="text" placeholder="230"
                    value={form.titulo}
                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
                </div>

                <div className="form-group span2">
                  <label className="form-label">Descrição do Produto</label>
                  <input className="form-control" type="text"
                    placeholder="FIO PES TEXT. A AR SO 2X100/96DTEX CRU"
                    value={form.descricao}
                    onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
                </div>

              </div>

              {/* Aviso de fusos */}
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
                <button className="btn btn-ghost btn-sm" onClick={() => setForm(EMPTY)}>Limpar</button>
              </div>
            </div>
          </div>

          {/* ZPL */}
          <div className="card no-print">
            <div className="card-header">
              <span className="card-title">ZPL — Zebra ZT230 · 200dpi · 50×30mm</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={copiarZPL}><Copy size={13} /> Copiar</button>
                <button className="btn btn-ghost btn-sm" onClick={baixarZPL}><Download size={13} /> Download</button>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="zpl-box">
                {zplPreview || '// Selecione Máquina, Lote e Produto para gerar o ZPL...'}
              </div>
            </div>
            {zplPreview && (
              <div style={{ padding: '8px 14px', fontSize: '.7rem', color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
                Preview do fuso 1. O arquivo final conterá todos os {totalFusos} fusos.
              </div>
            )}
          </div>
        </div>

        {/* PREVIEW */}
        <div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Preview — Fuso 1</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <LabelPreview
                record={{ ...form, fuso: 1, ciclo: cicloPreview || 1 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
