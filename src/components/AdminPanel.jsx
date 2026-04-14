import { useState, useRef, useEffect } from 'react';
import { conversationTree, SIGNAL_CONFIG } from './data/interviewFlow';

export default function App() {
  const [history, setHistory] = useState([{ nodeId: 'welcome' }]);
  const [userInput, setUserInput] = useState('');
  const [collectedData, setCollectedData] = useState({});
  const [signals, setSignals] = useState([]);
  const [isEnd, setIsEnd] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentNodeId = history[history.length - 1]?.nodeId;
  const currentNode = conversationTree[currentNodeId];

  // Auto-scroll al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Foco en input cuando toca escribir
  useEffect(() => {
    if (currentNode?.inputType === 'text' && !isEnd) {
      inputRef.current?.focus();
    }
  }, [currentNode, isEnd]);

  const handleOptionSelect = (option) => {
    // Guardar la respuesta seleccionada en el historial
    const newHistory = [...history];
    newHistory[newHistory.length - 1].userResponse = option.text;
    
    // Registrar señal si existe
    if (option.signal) {
      setSignals(prev => [...prev, { node: currentNodeId, signal: option.signal, response: option.text }]);
    }

    // Si hay saveAs, guardar en collectedData
    if (currentNode.saveAs) {
      setCollectedData(prev => ({ ...prev, [currentNode.saveAs]: option.text }));
    }

    // Si el nodo siguiente es final, marcar fin
    const nextNode = conversationTree[option.next];
    if (nextNode?.isEnd) {
      setIsEnd(true);
    }

    setHistory([...newHistory, { nodeId: option.next }]);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const response = userInput.trim();
    const newHistory = [...history];
    newHistory[newHistory.length - 1].userResponse = response;

    // Guardar en collectedData si corresponde
    if (currentNode.saveAs) {
      setCollectedData(prev => ({ ...prev, [currentNode.saveAs]: response }));
    }

    const nextNodeId = currentNode.next;
    const nextNode = conversationTree[nextNodeId];
    if (nextNode?.isEnd) {
      setIsEnd(true);
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
    setShowSummary(false);
  };

  const generateSummary = () => {
    const pos = signals.filter(s => s.signal === 'positive').length;
    const neu = signals.filter(s => s.signal === 'neutral').length;
    const neg = signals.filter(s => s.signal === 'negative').length;
    const total = pos + neu + neg;
    const score = total > 0 ? Math.round(((pos * 100 + neu * 50) / (total * 100)) * 100) : 0;

    return { pos, neu, neg, total, score };
  };

  const summary = generateSummary();

  // Renderizado de burbujas de chat
  const renderMessages = () => {
    return history.map((item, index) => {
      const node = conversationTree[item.nodeId];
      if (!node) return null;

      const isLast = index === history.length - 1;
      const showOptions = isLast && !isEnd && node.options && !item.userResponse;
      const showInput = isLast && !isEnd && node.inputType === 'text' && !item.userResponse;

      return (
        <div key={index}>
          {/* Burbuja del asistente */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: 16,
          }}>
            <div style={{
              maxWidth: '80%',
              background: 'var(--bubble-assistant)',
              padding: '14px 18px',
              borderRadius: '18px 18px 18px 4px',
              boxShadow: 'var(--shadow)',
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

          {/* Respuesta del usuario (si ya respondió) */}
          {item.userResponse && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: 16,
            }}>
              <div style={{
                maxWidth: '80%',
                background: 'var(--bubble-user)',
                padding: '12px 18px',
                borderRadius: '18px 18px 4px 18px',
                boxShadow: 'var(--shadow)',
                border: '1px solid #c7d9b7',
              }}>
                <p style={{ margin: 0, fontSize: 15, color: 'var(--text-dark)' }}>{item.userResponse}</p>
              </div>
            </div>
          )}

          {/* Opciones de respuesta (botones) */}
          {showOptions && (
            <div style={{ marginBottom: 16, marginLeft: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 8 }}>Seleccione una opción:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {node.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(opt)}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--border-light)',
                      borderRadius: 20,
                      padding: '12px 16px',
                      fontSize: 14,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
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

          {/* Campo de texto libre */}
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
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 24,
                    border: '1px solid var(--border-light)',
                    fontSize: 14,
                    outline: 'none',
                    background: '#fff',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 24,
                    padding: '12px 20px',
                    fontWeight: 600,
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

  // Pantalla final / resumen
  if (isEnd && showSummary) {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: 'var(--shadow)' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: 16 }}>📋 Resumen de la conversación</h2>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: SIGNAL_CONFIG.positive.color }}>{summary.pos}</div>
                <div>Señales positivas</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: SIGNAL_CONFIG.neutral.color }}>{summary.neu}</div>
                <div>Neutras</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: SIGNAL_CONFIG.negative.color }}>{summary.neg}</div>
                <div>Negativas</div>
              </div>
            </div>
            <div style={{ background: '#f0f0f0', borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <span style={{ fontWeight: 600 }}>Score de validación: </span>
              <span style={{ fontSize: 24, fontWeight: 800, color: summary.score >= 70 ? '#2e7d32' : summary.score >= 40 ? '#b45f2b' : '#c62828' }}>
                {summary.score}/100
              </span>
            </div>
          </div>

          <h3>Datos recopilados:</h3>
          <pre style={{ background: '#f9f9f9', padding: 16, borderRadius: 12, fontSize: 13, overflowX: 'auto' }}>
            {JSON.stringify(collectedData, null, 2)}
          </pre>

          <h3 style={{ marginTop: 20 }}>Señales registradas:</h3>
          <ul style={{ paddingLeft: 20 }}>
            {signals.map((s, i) => (
              <li key={i} style={{ color: SIGNAL_CONFIG[s.signal].color }}>
                [{s.signal}] {s.response}
              </li>
            ))}
          </ul>

          <button
            onClick={restart}
            style={{
              marginTop: 24,
              width: '100%',
              padding: 14,
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 30,
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            🔄 Iniciar nueva conversación
          </button>
        </div>
      </div>
    );
  }

  // Chat en progreso o final sin mostrar resumen aún
  return (
    <div style={{ 
      maxWidth: 600, 
      margin: '0 auto', 
      padding: '20px 16px', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--chat-bg)',
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px 0', 
        borderBottom: '1px solid var(--border-light)',
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)' }}>🩺 TSORALTA · Conversación con veterinarios</h1>
          <p style={{ fontSize: 12, color: 'var(--text-soft)' }}>Estudio sobre la práctica veterinaria en campo</p>
        </div>
        {!isEnd && history.length > 1 && (
          <button 
            onClick={restart}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-light)',
              borderRadius: 20,
              padding: '6px 12px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Reiniciar
          </button>
        )}
      </div>

      {/* Mensajes */}
      <div style={{ flex: 1 }}>
        {renderMessages()}
        <div ref={chatEndRef} />
      </div>

      {/* Botón para finalizar y ver resumen (si ya terminó la conversación) */}
      {isEnd && !showSummary && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => setShowSummary(true)}
            style={{
              width: '100%',
              padding: 16,
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 30,
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            Ver resumen de la conversación
          </button>
          <button
            onClick={restart}
            style={{
              width: '100%',
              marginTop: 12,
              padding: 14,
              background: 'transparent',
              border: '1px solid var(--border-light)',
              borderRadius: 30,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Comenzar otra entrevista
          </button>
        </div>
      )}

      {/* Indicador de señales (sutil) */}
      {!isEnd && (
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: SIGNAL_CONFIG.positive.color }}>▲ {summary.pos}</span>
          <span style={{ fontSize: 12, color: SIGNAL_CONFIG.neutral.color }}>● {summary.neu}</span>
          <span style={{ fontSize: 12, color: SIGNAL_CONFIG.negative.color }}>▼ {summary.neg}</span>
        </div>
      )}
    </div>
  );
}