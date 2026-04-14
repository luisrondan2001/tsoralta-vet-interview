import { useState, useRef, useEffect } from 'react';
import { conversationTree, SIGNAL_CONFIG } from './data/interviewFlow';
import AdminPanel from './components/AdminPanel';
import { supabase } from './lib/supabaseClient';

const STORAGE_KEY = 'tsoralta_interviews';

export default function App() {
  // Si la URL contiene #admin, mostramos el panel de administración
  if (window.location.hash === '#admin') {
    return <AdminPanel />;
  }

  const [history, setHistory] = useState([{ nodeId: 'welcome' }]);
  const [userInput, setUserInput] = useState('');
  const [collectedData, setCollectedData] = useState({});
  const [signals, setSignals] = useState([]);
  const [isEnd, setIsEnd] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentNodeId = history[history.length - 1]?.nodeId;
  const currentNode = conversationTree[currentNodeId];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    if (currentNode?.inputType === 'text' && !isEnd) {
      inputRef.current?.focus();
    }
  }, [currentNode, isEnd]);

  // Función para guardar la entrevista en localStorage
  const saveInterview = () => {
    const pos = signals.filter(s => s.signal === 'positive').length;
    const neu = signals.filter(s => s.signal === 'neutral').length;
    const neg = signals.filter(s => s.signal === 'negative').length;
    const total = pos + neu + neg;
    const score = total > 0 ? Math.round(((pos * 100 + neu * 50) / (total * 100)) * 100) : 0;

    const interviewData = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      metadata: {
        timestamp: new Date().toISOString(),
        score,
        signals: { positive: pos, neutral: neu, negative: neg }
      },
      collectedData,
      signalsList: signals,
      history: history.map(item => ({
        nodeId: item.nodeId,
        question: conversationTree[item.nodeId]?.text || '',
        response: item.userResponse || null
      }))
    };

    // Obtener entrevistas existentes
    const existing = localStorage.getItem(STORAGE_KEY);
    let interviews = [];
    if (existing) {
      try {
        interviews = JSON.parse(existing);
      } catch (e) {
        interviews = [];
      }
    }
    interviews.push(interviewData);
   async function guardarEntrevistasEnSupabase(interviews) {
  try {
    // Supabase espera un array de objetos. Si 'interviews' es un array, lo insertamos directamente.
    // Si 'interviews' es un objeto único, usa .insert([interviews])
    const { data, error } = await supabase
      .from('entrevistas')
      .insert(interviews)  // interviews debe ser un array de objetos
      .select();

    if (error) throw error;
    console.log('✅ Entrevistas guardadas en Supabase:', data);
  } catch (err) {
    console.error('❌ Error al guardar en Supabase:', err.message);
    // Opcional: mantener respaldo en localStorage por si falla
    localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
  }
}

// Llamar a la función en lugar de localStorage.setItem
guardarEntrevistasEnSupabase(interviews);
  };

  const handleOptionSelect = (option) => {
    const newHistory = [...history];
    newHistory[newHistory.length - 1].userResponse = option.text;
    
    if (option.signal) {
      setSignals(prev => [...prev, { nodeId: currentNodeId, signal: option.signal, response: option.text }]);
    }

    if (currentNode.saveAs) {
      setCollectedData(prev => ({ ...prev, [currentNode.saveAs]: option.text }));
    }

    const nextNode = conversationTree[option.next];
    if (nextNode?.isEnd) {
      setIsEnd(true);
      // Guardar la entrevista al llegar al final
      setTimeout(() => saveInterview(), 0);
    }

    setHistory([...newHistory, { nodeId: option.next }]);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const response = userInput.trim();
    const newHistory = [...history];
    newHistory[newHistory.length - 1].userResponse = response;

    if (currentNode.saveAs) {
      setCollectedData(prev => ({ ...prev, [currentNode.saveAs]: response }));
    }

    const nextNodeId = currentNode.next;
    const nextNode = conversationTree[nextNodeId];
    if (nextNode?.isEnd) {
      setIsEnd(true);
      setTimeout(() => saveInterview(), 0);
    }

    setHistory([...newHistory, { nodeId: nextNodeId }]);
    setUserInput('');
  };

  const restart = () => {
    setHistory([{ nodeId: 'welcome' }]);
    setUserInput('');
    setCollectedData({});
    setSignals([]);
    setIsEnd(false);
  };

  // Renderizado de mensajes (igual que antes)
  const renderMessages = () => {
    return history.map((item, index) => {
      const node = conversationTree[item.nodeId];
      if (!node) return null;

      const isLast = index === history.length - 1;
      const showOptions = isLast && !isEnd && node.options && !item.userResponse;
      const showInput = isLast && !isEnd && node.inputType === 'text' && !item.userResponse;

      return (
        <div key={index}>
          <div style={{
            display: 'flex', justifyContent: 'flex-start', marginBottom: 16,
          }}>
            <div style={{
              maxWidth: '80%', background: 'var(--bubble-assistant)', padding: '14px 18px',
              borderRadius: '18px 18px 18px 4px', boxShadow: 'var(--shadow)',
              border: '1px solid var(--border-light)',
            }}>
              <p style={{ margin: 0, fontSize: 15, color: 'var(--text-dark)' }}>{node.text}</p>
              {node.tip && (
                <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-soft)', fontStyle: 'italic' }}>
                  💡 {node.tip}
                </p>
              )}
            </div>
          </div>

          {item.userResponse && (
            <div style={{
              display: 'flex', justifyContent: 'flex-end', marginBottom: 16,
            }}>
              <div style={{
                maxWidth: '80%', background: 'var(--bubble-user)', padding: '12px 18px',
                borderRadius: '18px 18px 4px 18px', boxShadow: 'var(--shadow)',
                border: '1px solid #c7d9b7',
              }}>
                <p style={{ margin: 0, fontSize: 15, color: 'var(--text-dark)' }}>{item.userResponse}</p>
              </div>
            </div>
          )}

          {showOptions && (
            <div style={{ marginBottom: 16, marginLeft: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 8 }}>Seleccione una opción:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {node.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(opt)}
                    style={{
                      background: '#fff', border: '1px solid var(--border-light)',
                      borderRadius: 20, padding: '12px 16px', fontSize: 14,
                      textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#faf6f0'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showInput && (
            <form onSubmit={handleTextSubmit} style={{ marginBottom: 16, marginLeft: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder={node.placeholder || 'Escriba su respuesta...'}
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: 24,
                    border: '1px solid var(--border-light)', fontSize: 14,
                    outline: 'none', background: '#fff',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'var(--accent)', color: '#fff', border: 'none',
                    borderRadius: 24, padding: '12px 20px', fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Enviar
                </button>
              </div>
            </form>
          )}
        </div>
      );
    });
  };

  // Pantalla de agradecimiento (reemplaza al resumen)
  if (isEnd) {
    return (
      <div style={{ 
        maxWidth: 600, margin: '0 auto', padding: '40px 20px', textAlign: 'center',
        minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'
      }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 40, boxShadow: 'var(--shadow)' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: 16 }}>¡Muchas gracias, Doc!</h2>
          <p style={{ fontSize: 16, marginBottom: 32 }}>Su experiencia es muy valiosa para nosotros.</p>
          <button
            onClick={restart}
            style={{
              padding: '14px 32px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 30, fontWeight: 600, fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Realizar otra entrevista
          </button>
        </div>
      </div>
    );
  }

  // Chat normal
  return (
    <div style={{ 
      maxWidth: 600, margin: '0 auto', padding: '20px 16px', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', background: 'var(--chat-bg)',
    }}>
      <div style={{ 
        padding: '16px 0', borderBottom: '1px solid var(--border-light)',
        marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)' }}>🩺 TSORALTA · Conversación con veterinarios</h1>
          <p style={{ fontSize: 12, color: 'var(--text-soft)' }}>Estudio sobre la práctica veterinaria en campo</p>
        </div>
        {history.length > 1 && (
          <button 
            onClick={restart}
            style={{
              background: 'transparent', border: '1px solid var(--border-light)',
              borderRadius: 20, padding: '6px 12px', fontSize: 12, cursor: 'pointer',
            }}
          >
            Reiniciar
          </button>
        )}
      </div>

      <div style={{ flex: 1 }}>
        {renderMessages()}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}