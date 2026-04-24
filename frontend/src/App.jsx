import { useState } from 'react';
import axios from 'axios';
import './App.css';

// Tree renderer
const RecursiveNode = ({ node }) => {
if (!node) return null;

const key = Object.keys(node)[0];
const children = node[key];

return ( <div className="tree-node"> <span className="node-tag">{key}</span>
{children &&
Object.keys(children).map((childKey, i) => (
<RecursiveNode
key={i}
node={{ [childKey]: children[childKey] }}
/>
))} </div>
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

```
try {
  const payload = JSON.parse(input);

  const res = await axios.post(
    "https://bfhl-api-xa10.onrender.com/bfhl",
    { data: payload },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  setData(res.data);

} catch (e) {
  setError("Invalid input format or server error.");
} finally {
  setLoading(false);
}
```

};

return ( <div className="app-wrapper">

```
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
        {loading ? "Processing..." : "Analyze Structure"}
      </button>
    </div>

    {error && (
      <div style={{ color: 'red', marginTop: 20 }}>
        {error}
      </div>
    )}

    {data && (
      <div className="summary-grid">
        <p>Trees: {data.summary.total_trees}</p>
        <p>Cycles: {data.summary.total_cycles}</p>
        <p>Largest Root: {data.summary.largest_tree_root || "N/A"}</p>
      </div>
    )}
  </div>

  {data && (
    <div className="main-content">
      {data.hierarchies.map((h, i) => (
        <div key={i} className="tree-card">

          <h3>
            {h.has_cycle
              ? "⚠️ Cycle Detected"
              : `🌳 Root: ${h.root}`}
          </h3>

          {h.has_cycle ? (
            <p>Cycle exists</p>
          ) : (
            <RecursiveNode node={h.tree} />
          )}

        </div>
      ))}
    </div>
  )}

</div>
```

);
}

export default App;
