import { useState } from "react";
import axios from "axios";

function App() {
  const [input, setInput] = useState('["A->B","B->C"]');
  const [data, setData] = useState(null);

  const analyze = async () => {
    try {
      const payload = JSON.parse(input);

      const res = await axios.post(
        "https://bfhl-api-xa10.onrender.com/bfhl",
        { data: payload }
      );

      setData(res.data);
    } catch (err) {
      alert("Error");
    }
  };

  return (
    <div>
      <h1>Tree Analyzer</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={analyze}>Analyze</button>

      {data && (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

export default App;
