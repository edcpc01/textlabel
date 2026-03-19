// src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, doc, addDoc, updateDoc,
  deleteDoc, getDoc, onSnapshot, query, orderBy,
  writeBatch, serverTimestamp, runTransaction, setDoc,
} from 'firebase/firestore'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db   = getFirestore(app)
export const auth = getAuth(app)

// ─── AUTH ──────────────────────────────────────────────
export const login        = (email, pwd)  => signInWithEmailAndPassword(auth, email, pwd)
export const logout       = ()            => signOut(auth)
export const onAuth       = (cb)          => onAuthStateChanged(auth, cb)
export const cadastrarUser = async (nome, email, pwd) => {
  const cred = await createUserWithEmailAndPassword(auth, email, pwd)
  await updateProfile(cred.user, { displayName: nome })
  return cred.user
}
export const resetSenha   = (email)       => sendPasswordResetEmail(auth, email)

// ─── CICLO POR LOTE + MÁQUINA ──────────────────────────
function cicloDocId(lote, maquina) {
  const safe = s => String(s).replace(/[^a-zA-Z0-9\-_]/g, '_')
  return `${safe(lote)}__${safe(maquina)}`
}

export async function getNextCicloLoteMaq(lote, maquina) {
  const ref = doc(db, 'ciclos', cicloDocId(lote, maquina))
  let nextCiclo
  await runTransaction(db, async tx => {
    const snap = await tx.get(ref)
    if (!snap.exists()) {
      nextCiclo = 1
      tx.set(ref, { lote, maquina, valor: 2, atualizadoEm: serverTimestamp() })
    } else {
      nextCiclo = snap.data().valor
      tx.update(ref, { valor: nextCiclo + 1, atualizadoEm: serverTimestamp() })
    }
  })
  return nextCiclo
}

export async function getCicloAtualLoteMaq(lote, maquina) {
  if (!lote || !maquina) return null
  const snap = await getDoc(doc(db, 'ciclos', cicloDocId(lote, maquina)))
  return snap.exists() ? snap.data().valor : 1
}

export async function setCicloManualLoteMaq(lote, maquina, valor) {
  const ref = doc(db, 'ciclos', cicloDocId(lote, maquina))
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await updateDoc(ref, { valor: Number(valor) })
  } else {
    await setDoc(ref, { lote, maquina, valor: Number(valor), atualizadoEm: serverTimestamp() })
  }
}

export function onCiclos(cb) {
  return onSnapshot(collection(db, 'ciclos'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── EMITIR CICLO ──────────────────────────────────────
// Recebe userEmail e userName do usuário logado
export async function emitirCiclo({
  lote, maquina, maquinaFusos, produto, descricao,
  composicao, titulo, data, empresa, cnpj,
  empresaNome, userEmail, userName,
}) {
  const ciclo      = await getNextCicloLoteMaq(lote, maquina)
  const totalFusos = Math.max(1, parseInt(maquinaFusos) || 1)
  const ts         = serverTimestamp()

  const cicloRef = await addDoc(collection(db, 'emissoes'), {
    ciclo, lote, maquina, produto, descricao, composicao,
    titulo, data, totalFusos, empresa, cnpj, empresaNome,
    userEmail: userEmail || '',
    userName:  userName  || '',
    criadoEm: ts,
  })

  const batch = writeBatch(db)
  for (let fuso = 1; fuso <= totalFusos; fuso++) {
    batch.set(doc(collection(db, 'etiquetas')), {
      ciclo, lote, maquina, fuso, produto, descricao,
      composicao, titulo, data, empresa, cnpj, empresaNome,
      userEmail: userEmail || '',
      userName:  userName  || '',
      emissaoId: cicloRef.id, criadoEm: ts,
    })
  }
  await batch.commit()

  return { ciclo, totalFusos, emissaoId: cicloRef.id }
}

// ─── EMISSÕES ──────────────────────────────────────────
export function onEmissoes(cb) {
  const q = query(collection(db, 'emissoes'), orderBy('criadoEm', 'desc'))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export function onEtiquetas(cb) {
  const q = query(collection(db, 'etiquetas'), orderBy('criadoEm', 'desc'))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

// ─── PRODUTOS ──────────────────────────────────────────
export const addProduto    = d  => addDoc(collection(db, 'produtos'), d)
export const deleteProduto = id => deleteDoc(doc(db, 'produtos', id))
export function onProdutos(cb) {
  return onSnapshot(collection(db, 'produtos'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── MÁQUINAS ──────────────────────────────────────────
export const addMaquina    = d  => addDoc(collection(db, 'maquinas'), d)
export const deleteMaquina = id => deleteDoc(doc(db, 'maquinas', id))
export function onMaquinas(cb) {
  return onSnapshot(collection(db, 'maquinas'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ─── CONFIG EMPRESA ────────────────────────────────────
export async function getEmpresa() {
  const snap = await getDoc(doc(db, 'meta', 'empresa'))
  return snap.exists() ? snap.data() : {}
}
export async function setEmpresa(data) {
  return setDoc(doc(db, 'meta', 'empresa'), data, { merge: true })
}
