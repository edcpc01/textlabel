// src/pages/CadastroPage.jsx
import { useState, useEffect } from 'react'
import { Trash2, Plus, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  onProdutos, addProduto, deleteProduto,
  onMaquinas, addMaquina, deleteMaquina,
  getEmpresa, setEmpresa,
} from '../lib/firebase'

function useCollection(onFn) {
  const [items, setItems] = useState([])
  useEffect(() => { const u = onFn(setItems); return u }, [])
  return items
}

function CadTable({ columns, rows, onDelete }) {
  if (!rows.length) {
    return <div className="empty"><p>Nenhum registro cadastrado.</p></div>
  }
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th /></tr></thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              {columns.map(c => (
                <td key={c.key} className={c.cls || ''}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] || '—')}
                </td>
              ))}
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(row.id)}>
                  <Trash2 size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── EMPRESA ──────────────────────────────────────────
function EmpresaCard() {
  const [f, setF] = useState({ nome: '', cnpj: '' })
  const [loading, setLoading] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    getEmpresa().then(d => {
      if (d?.nome || d?.cnpj) setF({ nome: d.nome || '', cnpj: d.cnpj || '' })
    })
  }, [])

  async function salvar() {
    if (!f.nome) { toast.error('Informe o nome da empresa.'); return }
    setLoading(true)
    try {
      await setEmpresa({ nome: f.nome.trim(), cnpj: f.cnpj.trim() })
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2000)
      toast.success('Empresa salva!')
    } catch (e) { toast.error('Erro: ' + e.message) }
    setLoading(false)
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <span className="card-title">EMPRESA</span>
        <span style={{ fontSize: '.73rem', color: 'var(--muted)' }}>
          Aparece no cabeçalho de todas as etiquetas
        </span>
      </div>
      <div className="card-body">
        <div className="form-grid">
          <div className="form-group span2">
            <label className="form-label">Razão Social / Nome da Empresa</label>
            <input
              className="form-control"
              placeholder="Nome da Empresa"
              value={f.nome}
              onChange={e => setF(p => ({ ...p, nome: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">CNPJ</label>
            <input
              className="form-control"
              placeholder="00.000.000/0000-00"
              value={f.cnpj}
              onChange={e => setF(p => ({ ...p, cnpj: e.target.value }))}
            />
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          style={{ marginTop: 14 }}
          onClick={salvar}
          disabled={loading}
        >
          <Save size={13} />
          {loading ? 'Salvando...' : salvo ? '✓ Salvo!' : 'Salvar Empresa'}
        </button>
      </div>
    </div>
  )
}

// ─── PRODUTOS ─────────────────────────────────────────
function ProdutosCard({ produtos }) {
  const [f, setF] = useState({ cod: '', desc: '', comp: '', bitola: '', un: 'kg' })

  async function salvar() {
    if (!f.cod || !f.desc) { toast.error('Código e descrição são obrigatórios.'); return }
    if (produtos.find(p => p.cod === f.cod.toUpperCase())) { toast.error('Código já existe.'); return }
    await addProduto({ ...f, cod: f.cod.toUpperCase() })
    setF({ cod: '', desc: '', comp: '', bitola: '', un: 'kg' })
    toast.success('Produto salvo!')
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <span className="card-title">PRODUTOS (FIOS)</span>
        <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{produtos.length} cadastrados</span>
      </div>
      <div className="card-body">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Código</label>
            <input className="form-control" placeholder="FIO-001" value={f.cod}
              onChange={e => setF(p => ({ ...p, cod: e.target.value }))} />
          </div>
          <div className="form-group span2">
            <label className="form-label">Descrição</label>
            <input className="form-control" placeholder="Fio Têxtil 100% Algodão Penteado" value={f.desc}
              onChange={e => setF(p => ({ ...p, desc: e.target.value }))} />
          </div>
          <div className="form-group span3">
            <label className="form-label">Composição Padrão</label>
            <input className="form-control" placeholder="Ex: 60% Algodão, 40% Poliéster" value={f.comp}
              onChange={e => setF(p => ({ ...p, comp: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Bitola / Título</label>
            <input className="form-control" placeholder="Ex: Ne 30/1" value={f.bitola}
              onChange={e => setF(p => ({ ...p, bitola: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Unidade</label>
            <select className="form-control" value={f.un}
              onChange={e => setF(p => ({ ...p, un: e.target.value }))}>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="m">m</option>
              <option value="con">cone</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={salvar}>
          <Plus size={13} /> Salvar Produto
        </button>
        <div style={{ marginTop: 20 }}>
          <CadTable
            columns={[
              { key: 'cod',    label: 'Código',     render: v => <span className="badge badge-blue">{v}</span> },
              { key: 'desc',   label: 'Descrição' },
              { key: 'comp',   label: 'Composição', cls: 'td-mono' },
              { key: 'bitola', label: 'Bitola',     cls: 'td-mono' },
              { key: 'un',     label: 'Un.',        render: v => <span className="badge badge-orange">{v}</span> },
            ]}
            rows={produtos}
            onDelete={async id => {
              if (!confirm('Excluir produto?')) return
              await deleteProduto(id)
              toast.success('Removido.')
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── MÁQUINAS ─────────────────────────────────────────
function MaquinasCard({ maquinas }) {
  const [f, setF] = useState({ cod: '', desc: '', fusos: '', local: '' })

  async function salvar() {
    if (!f.cod || !f.desc) { toast.error('Código e descrição são obrigatórios.'); return }
    if (!f.fusos || parseInt(f.fusos) < 1) { toast.error('Informe o número de fusos.'); return }
    if (maquinas.find(m => m.cod === f.cod.toUpperCase())) { toast.error('Código já existe.'); return }
    await addMaquina({ ...f, cod: f.cod.toUpperCase(), fusos: parseInt(f.fusos) })
    setF({ cod: '', desc: '', fusos: '', local: '' })
    toast.success('Máquina salva!')
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">MÁQUINAS</span>
        <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{maquinas.length} cadastradas</span>
      </div>
      <div className="card-body">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Código / ID</label>
            <input className="form-control" placeholder="MAQ-01" value={f.cod}
              onChange={e => setF(p => ({ ...p, cod: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <input className="form-control" placeholder="Filatório Anel #1" value={f.desc}
              onChange={e => setF(p => ({ ...p, desc: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Nº de Fusos *</label>
            <input className="form-control" type="number" min="1" placeholder="Ex: 72" value={f.fusos}
              onChange={e => setF(p => ({ ...p, fusos: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Localização</label>
            <input className="form-control" placeholder="Setor A — Linha 3" value={f.local}
              onChange={e => setF(p => ({ ...p, local: e.target.value }))} />
          </div>
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={salvar}>
          <Plus size={13} /> Salvar Máquina
        </button>
        <div style={{ marginTop: 20 }}>
          <CadTable
            columns={[
              { key: 'cod',   label: 'Código',   render: v => <span className="badge badge-blue">{v}</span> },
              { key: 'desc',  label: 'Descrição' },
              { key: 'fusos', label: 'Fusos', cls: 'td-mono td-center',
                render: v => <strong style={{ color: 'var(--accent)' }}>{v}</strong> },
              { key: 'local', label: 'Localização' },
            ]}
            rows={maquinas}
            onDelete={async id => {
              if (!confirm('Excluir máquina?')) return
              await deleteMaquina(id)
              toast.success('Removida.')
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────
export function CadastroPage() {
  const produtos = useCollection(onProdutos)
  const maquinas = useCollection(onMaquinas)

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Cadastros</h1>
        <p className="page-subtitle">Empresa · Produtos · Máquinas — sincronizados via Firestore</p>
      </div>
      <EmpresaCard />
      <ProdutosCard produtos={produtos} />
      <MaquinasCard maquinas={maquinas} />
    </div>
  )
}
