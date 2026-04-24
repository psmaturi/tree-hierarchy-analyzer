const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// USER METADATA
const METADATA = {
    user_id: "john_doe_24042026",
    email_id: "john.doe@college.edu",
    college_roll_number: "2021CS101"
};

// 🔹 DEBUG ROUTE (IMPORTANT)
app.get("/", (req, res) => {
    res.send("API is working");
});

const processGraph = (data) => {
    const invalid_entries = [];
    const duplicate_edges = [];
    const seenEdges = new Set();
    const parentOf = {};
    const adj = {};
    const nodes = new Set();

    // STEP 1: Validation + Build graph
    data.forEach(entry => {
        if (!/^[A-Z]->[A-Z]$/.test(entry)) {
            invalid_entries.push(entry);
            return;
        }

        if (seenEdges.has(entry)) {
            if (!duplicate_edges.includes(entry)) duplicate_edges.push(entry);
            return;
        }
        seenEdges.add(entry);

        const [u, v] = entry.split('->');
        nodes.add(u);
        nodes.add(v);

        // First parent wins
        if (parentOf[v]) return;

        parentOf[v] = u;
        if (!adj[u]) adj[u] = [];
        adj[u].push(v);
    });

    // STEP 2: Build components
    const unvisited = new Set(nodes);
    const components = [];

    while (unvisited.size) {
        const start = unvisited.values().next().value;
        const comp = new Set();
        const stack = [start];

        while (stack.length) {
            const node = stack.pop();
            if (comp.has(node)) continue;

            comp.add(node);
            unvisited.delete(node);

            (adj[node] || []).forEach(child => stack.push(child));
            if (parentOf[node]) stack.push(parentOf[node]);
        }

        components.push(comp);
    }

    const hierarchies = [];
    let totalCycles = 0;
    let maxDepth = -1;
    let largestRoot = "";

    // STEP 3: Cycle detection
    const detectCycle = (node, visited = new Set(), stack = new Set()) => {
        if (stack.has(node)) return true;
        if (visited.has(node)) return false;

        visited.add(node);
        stack.add(node);

        for (let child of adj[node] || []) {
            if (detectCycle(child, visited, stack)) return true;
        }

        stack.delete(node);
        return false;
    };

    // STEP 4: Build tree
    const buildTree = (node) => {
        let result = {};
        result[node] = {};

        for (let child of adj[node] || []) {
            Object.assign(result[node], buildTree(child));
        }

        return result;
    };

    // STEP 5: Calculate depth
    const getDepth = (node) => {
        let max = 0;
        for (let child of adj[node] || []) {
            max = Math.max(max, getDepth(child));
        }
        return 1 + max;
    };

    // STEP 6: Process components
    components.forEach(comp => {
        const compRoots = Array.from(comp).filter(n => !parentOf[n]);

        const root = compRoots.length
            ? compRoots[0]
            : Array.from(comp).sort()[0];

        const hasCycle = detectCycle(root);

        if (hasCycle) {
            hierarchies.push({
                root,
                tree: {},
                has_cycle: true
            });
            totalCycles++;
        } else {
            const tree = buildTree(root);
            const depth = getDepth(root);

            hierarchies.push({
                root,
                tree,
                depth
            });

            if (
                depth > maxDepth ||
                (depth === maxDepth && root < largestRoot)
            ) {
                maxDepth = depth;
                largestRoot = root;
            }
        }
    });

    return {
        ...METADATA,
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees: hierarchies.filter(h => !h.has_cycle).length,
            total_cycles: totalCycles,
            largest_tree_root: largestRoot
        }
    };
};

// 🔹 API ROUTE WITH LOGGING
app.post('/bfhl', (req, res) => {
    try {
        console.log("Incoming request:", req.body);

        const { data } = req.body;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ error: "Invalid data format" });
        }

        const result = processGraph(data);
        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// START SERVER
app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
