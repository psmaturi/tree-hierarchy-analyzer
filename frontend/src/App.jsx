import { useState } from 'react';
import axios from 'axios';
import './App.css';

const RecursiveNode = ({ node }) => {
  if (!node || !node.name) return null;
  return (
    <div className="tree-node">
      <span className="node-tag">{node.name}</span>
      {node.children && node.children.map((child, i) => (
        <RecursiveNode key={i} node={child} />
      ))}
    </div>
  );
};

function App() {
  const [input, setInput] = useState('["A->B", "A->C", "B->D", "E->F", "F->E"]');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = JSON.parse(input);
      const res = await axios.post('http://localhost:5000/bfhl', { data: payload });
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.error || "Invalid input format or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <header className="hero">
        <h1>OrgStructure Pro</h1>
        <p>Advanced Graph Hierarchy Analysis System</p>
      </header>

      <div className="card">
        <div className="input-container">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='["A->B", "B->C"]'
          />
          <button className="btn-primary" onClick={analyze} disabled={loading}>
            {loading ? <div style={{display:'flex', gap:10, justifyContent:'center'}}><div className="spinner"></div> Processing...</div> : 'Analyze Structure'}
          </button>
        </div>

        {error && <div style={{color:'var(--danger)', marginTop:20, textAlign:'center'}}>{error}</div>}

        {data && (
          <div className="summary-grid">
            <div className="stat-item">
              <label>Trees Found</label>
              <span className="val" style={{color:'var(--success)'}}>{data.summary.total_trees}</span>
            </div>
            <div className="stat-item">
              <label>Cycles Found</label>
              <span className="val" style={{color:'var(--danger)'}}>{data.summary.total_cycles}</span>
            </div>
            <div className="stat-item">
              <label>Largest Root</label>
              <span className="val">{data.summary.largest_tree_root || "N/A"}</span>
            </div>
          </div>
        )}
      </div>

      {data && (
        <div className="main-content">
          <div className="tree-explorer">
            <h2 style={{fontSize:18, marginBottom:20, color:'var(--text-dim)'}}>HIERARCHY EXPLORER</h2>
            {data.hierarchies.map((h, i) => (
              <div key={i} className={`tree-card ${h.has_cycle ? 'cycle' : 'valid'}`}>
                <div className="tree-header">
                  <span style={{fontWeight:700}}>{h.has_cycle ? '⚠️ Cycle Detected' : `🌳 Hierarchy: ${h.root}`}</span>
                  {!h.has_cycle && <span style={{fontSize:12, color:'var(--text-dim)'}}>Depth: {h.depth}</span>}
                </div>
                {h.has_cycle ? (
                  <p style={{color:'var(--text-dim)', fontSize:14}}>This hierarchy starting at <b>{h.root}</b> contains a cyclic dependency and cannot be rendered as a tree.</p>
                ) : (
                  <RecursiveNode node={h.tree} />
                )}
              </div>
            ))}
          </div>

          <div className="log-section">
            <h2 style={{fontSize:18, marginBottom:20, color:'var(--text-dim)'}}>ANALYSIS LOGS</h2>
            
            <div className="log-group">
              <label style={{fontSize:11, color:'var(--danger)', fontWeight:700}}>INVALID FORMATS</label>
              {data.invalid_entries.length === 0 && <p style={{fontSize:13, color:'var(--text-dim)'}}>None</p>}
              {data.invalid_entries.map((e, i) => <div key={i} className="log-pill">{e} <span style={{color:'var(--danger)'}}>Format</span></div>)}
            </div>

            <div className="log-group" style={{marginTop:20}}>
              <label style={{fontSize:11, color:'var(--text-dim)', fontWeight:700}}>DUPLICATE EDGES</label>
              {data.duplicate_edges.length === 0 && <p style={{fontSize:13, color:'var(--text-dim)'}}>None</p>}
              {data.duplicate_edges.map((e, i) => <div key={i} className="log-pill">{e} <span style={{color:'var(--text-dim)'}}>Ignored</span></div>)}
            </div>

            <div className="log-group" style={{marginTop:40, padding:20, background:'rgba(255,255,255,0.02)', borderRadius:16}}>
              <label style={{fontSize:11, color:'var(--primary)', fontWeight:700}}>SESSION INFO</label>
              <div style={{fontSize:13, marginTop:10}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}><span>User:</span> <b>{data.user_id}</b></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span>Roll:</span> <b>{data.college_roll_number}</b></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
