import { useState, useEffect } from 'react';

const STORAGE_KEY = 'tsoralta_interviews';
const ADMIN_PASSWORD = 'tsoralta2024'; // Cámbiala por una más segura

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authenticated) {
      loadInterviews();
    }
  }, [authenticated]);

  const loadInterviews = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setInterviews(JSON.parse(stored));
      } catch (e) {
        setInterviews([]);
      }
    } else {
      setInterviews([]);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const deleteInterview = (id) => {
    const updated = interviews.filter(i => i.id !== id);
    setInterviews(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (selectedInterview?.id === id) setSelectedInterview(null);
  };

  const deleteAll = () => {
    if (window.confirm('¿Seguro que quieres eliminar TODAS las entrevistas?')) {
      setInterviews([]);
      localStorage.removeItem(STORAGE_KEY);
      setSelectedInterview(null);
    }
  };

  const exportAllJSON = () => {
    const dataStr = JSON.stringify(interviews, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tsoralta_entrevistas_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllCSV = () => {
    if (interviews.length === 0) return;
    
    // Cabeceras del CSV
    const headers = [
      'ID', 'Fecha', 'Score', 'Positivas', 'Neutras', 'Negativas',
      'Nombre', 'Zona', 'Disposición a pagar', 'Contacto', 'Respuestas clave'
    ];
    
    const rows = interviews.map(iv => {
      const data = iv.collectedData || {};
      return [
        iv.id,
        new Date(iv.metadata.timestamp).toLocaleString(),
        iv.metadata.score,
        iv.metadata.signals.positive,
        iv.metadata.signals.neutral,
        iv.metadata.signals.negative,
        data.vetName || '',
        data.zone || '',
        data.willingnessAmount || '',
        data.contactWhatsApp || data.contact || '',
        iv.signalsList?.map(s => `${s.signal}:${s.response}`).join('; ') || ''
      ];
    });
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM para UTF-8
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tsoralta_entrevistas_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authenticated) {
    return (
      <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
        <h2>🔐 Acceso Administrador</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
            style={{ width: '100%', padding: 12, marginBottom: 10, borderRadius: 8, border: '1px solid #ccc' }}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" style={{ width: '100%', padding: 12, background: '#b45f2b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
            Ingresar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>📊 Panel de Entrevistas TSORALTA</h1>
        <div>
          <button onClick={exportAllJSON} style={{ marginRight: 10, padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 6 }}>
            ⬇️ Exportar JSON
          </button>
          <button onClick={exportAllCSV} style={{ marginRight: 10, padding: '8px 16px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 6 }}>
            📄 Exportar CSV
          </button>
          <button onClick={deleteAll} style={{ padding: '8px 16px', background: '#c62828', color: '#fff', border: 'none', borderRadius: 6 }}>
            🗑️ Eliminar todo
          </button>
        </div>
      </div>

      <p>Total de entrevistas almacenadas: <strong>{interviews.length}</strong></p>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Lista de entrevistas */}
        <div style={{ flex: 1, maxWidth: 300, borderRight: '1px solid #ddd', paddingRight: 20 }}>
          <h3>Entrevistas</h3>
          {interviews.length === 0 ? (
            <p>No hay entrevistas aún.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {interviews.slice().reverse().map(iv => (
                <li key={iv.id} style={{
                  padding: 10, marginBottom: 8, background: selectedInterview?.id === iv.id ? '#f0e6d2' : '#f9f9f9',
                  borderRadius: 8, cursor: 'pointer', border: '1px solid #ddd'
                }} onClick={() => setSelectedInterview(iv)}>
                  <div style={{ fontWeight: 600 }}>{iv.collectedData?.vetName || 'Anónimo'}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{new Date(iv.metadata.timestamp).toLocaleString()}</div>
                  <div style={{ fontSize: 12 }}>Score: {iv.metadata.score}/100</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detalle de entrevista seleccionada */}
        <div style={{ flex: 2 }}>
          {selectedInterview ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3>Detalle de entrevista</h3>
                <button onClick={() => deleteInterview(selectedInterview.id)} style={{ padding: '4px 12px', background: '#ffebee', border: '1px solid #c62828', borderRadius: 6, color: '#c62828' }}>
                  Eliminar esta
                </button>
              </div>
              <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, overflowX: 'auto', fontSize: 13 }}>
                {JSON.stringify(selectedInterview, null, 2)}
              </pre>
            </div>
          ) : (
            <p>Selecciona una entrevista para ver los detalles.</p>
          )}
        </div>
      </div>
    </div>
  );
}