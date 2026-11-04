import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

const pintas = {
  diamante: '♦️',
  corazon: '♥️',
  trebol: '♣️',
  pica: '♠️'
};

function valor(n) {
  if (n === 'A') return 1;
  if (n === 'J') return 11;
  if (n === 'Q') return 12;
  if (n === 'K') return 13;
  return parseInt(n);
}

function App() {
  const [numero, setNumero] = useState('');
  const [pinta, setPinta] = useState('diamante');
  const [cartas, setCartas] = useState([]);
  const [resultado, setResultado] = useState('');

  function agregar() {
    const num = numero.trim().toUpperCase();
    const esJoker = num === 'JOKER' || num === 'COMODIN' || num === '*';

    if (!esJoker && !['A', 'J', 'Q', 'K', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(num)) {
      alert('Número no válido. Usa A, 2-10, J, Q, K o JOKER');
      return;
    }

    if (esJoker) {
      const jokers = cartas.filter(c => c.joker).length;
      if (jokers >= 4) {
        alert('Ya usaste los 4 jokers');
        return;
      }
      setCartas([...cartas, { id: Date.now(), numero: 'JOKER', pinta: 'joker', joker: true }]);
    } else {
      const iguales = cartas.filter(c => c.numero === num && c.pinta === pinta).length;
      if (iguales >= 2) {
        alert('Ya hay 2 cartas iguales de esa pinta');
        return;
      }
      setCartas([...cartas, { id: Date.now(), numero: num, pinta: pinta, joker: false }]);
    }

    setNumero('');
    setResultado('');
  }

  function quitar(id) {
    setCartas(cartas.filter(c => c.id !== id));
  }

  function ordenar(por) {
    const copia = [...cartas];
    if (por === 'numero') copia.sort((a, b) => (a.joker ? 99 : valor(a.numero)) - (b.joker ? 99 : valor(b.numero)));
    if (por === 'pinta') copia.sort((a, b) => a.pinta.localeCompare(b.pinta));
    setCartas(copia);
  }

  async function validar() {
    if (cartas.length !== 13) {
      setResultado('NO FORMA JUEGO :C');
      return;
    }

    const jokers = cartas.filter(c => c.joker);
    const normales = cartas.filter(c => !c.joker);

    let forma = false;

    if (normales.length > 0) {
      const mismaPinta = normales.every(c => c.pinta === normales[0].pinta);
      if (mismaPinta) {
        const nums = normales.map(c => valor(c.numero)).sort((a, b) => a - b);
        const repetidos = nums.some((v, i) => i > 0 && v === nums[i - 1]);
        if (!repetidos) {
          let huecos = 0;
          for (let i = 1; i < nums.length; i++) {
            huecos += nums[i] - nums[i - 1] - 1;
          }
          if (huecos <= jokers.length) forma = true;
        }
      }
    }

    if (forma) {
      setResultado('¡ESCALA REAL!');
      try {
        await addDoc(collection(db, 'jugadascarioca'), {
          cartas: cartas.map(c => ({ numero: c.numero, pinta: c.pinta })),
          fecha: new Date()
        });
      } catch (e) {
        console.log(e);
      }
    } else {
      setResultado('NO FORMA JUEGO :C');
    }
  }

  return (
    <div className="container mt-4">
      <h2>Carioca - Escala Real</h2>

      <div className="row g-2 mt-3">
        <div className="col-auto">
          <input
            className="form-control"
            placeholder="Número/letra o joker"
            value={numero}
            onChange={e => setNumero(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <select className="form-select" value={pinta} onChange={e => setPinta(e.target.value)}>
            <option value="diamante">Diamante ♦️</option>
            <option value="corazon">Corazón ♥️</option>
            <option value="trebol">Trébol ♣️</option>
            <option value="pica">Pica ♠️</option>
          </select>
        </div>
        <div className="col-auto">
          <motion.button whileTap={{ scale: 0.85 }} className="btn btn-primary" onClick={agregar}>
            Agregar
          </motion.button>
        </div>
      </div>

      <div className="mt-3">
        <button className="btn btn-success me-2" onClick={validar}>Validar Juego</button>
        <button className="btn btn-secondary me-2" onClick={() => ordenar('numero')}>Ordenar por número</button>
        <button className="btn btn-secondary" onClick={() => ordenar('pinta')}>Ordenar por pinta</button>
      </div>

      <div className="d-flex flex-wrap gap-3 mt-4">
        <AnimatePresence>
          {cartas.map(c => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: 100, rotate: 90 }}
              className={c.pinta === 'corazon' || c.pinta === 'diamante' ? 'carta roja' : 'carta negra'}
            >
              <button className="x" onClick={() => quitar(c.id)}>X</button>
              <div className="emoji">{c.joker ? '🃏' : pintas[c.pinta]}</div>
              <div className="fw-bold">{c.numero}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {resultado !== '' && (
        <motion.h1
          key={resultado}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-4"
        >
          {resultado}
        </motion.h1>
      )}
    </div>
  );
}

export default App;
