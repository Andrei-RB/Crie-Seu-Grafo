class Graph {
    constructor(vertexCount) {
        this.V = vertexCount;
        this.adjMatrix = [];
        this.visited = [];
        this.path = [];
        this.parent = [];
        this.pathIndex = 0;
        
        // Initialize adjacency matrix with zeros
        for (let i = 0; i < this.V; i++) {
            this.adjMatrix[i] = new Array(this.V).fill(0);
            this.visited[i] = 0;
            this.path[i] = 0;
            this.parent[i] = -1;
        }
    }
    
    addEdge(v1, v2) {
        // Convert to 0-based index
        v1--;
        v2--;
        
        if (v1 >= 0 && v1 < this.V && v2 >= 0 && v2 < this.V) {
            this.adjMatrix[v1][v2] = 1;
            this.adjMatrix[v2][v1] = 1; // Undirected graph
            return true;
        }
        return false;
    }
    
    bfs(start, end) {
        // Reset tracking arrays
        for (let i = 0; i < this.V; i++) {
            this.visited[i] = 0;
            this.path[i] = 0;
            this.parent[i] = -1;
        }
        this.pathIndex = 0;
        
        const queue = [];
        this.visited[start] = 1;
        this.parent[start] = -1;
        queue.push(start);
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (current === end) {
                // Reconstruct path
                let node = end;
                this.pathIndex = 0;
                while (node !== -1) {
                    this.path[this.pathIndex++] = node + 1;
                    node = this.parent[node];
                }
                // Reverse path
                for (let i = 0; i < this.pathIndex / 2; i++) {
                    const temp = this.path[i];
                    this.path[i] = this.path[this.pathIndex - 1 - i];
                    this.path[this.pathIndex - 1 - i] = temp;
                }
                return true;
            }
            
            for (let i = 0; i < this.V; i++) {
                if (this.adjMatrix[current][i] === 1 && this.visited[i] === 0) {
                    this.visited[i] = 1;
                    this.parent[i] = current;
                    queue.push(i);
                }
            }
        }
        
        return false;
    }
    
    dfs(start, end) {
        // Reset tracking arrays (except visited which is used during DFS)
        for (let i = 0; i < this.V; i++) {
            this.path[i] = 0;
        }
        this.pathIndex = 0;
        this.visited.fill(0);
        
        this._dfsUtil(start, end);
        
        return this.pathIndex > 0 && this.path[this.pathIndex - 1] === end + 1;
    }
    
    _dfsUtil(current, end) {
        this.visited[current] = 1;
        this.path[this.pathIndex++] = current + 1;
        
        if (current === end) {
            return;
        }
        
        for (let i = 0; i < this.V; i++) {
            if (this.adjMatrix[current][i] === 1 && this.visited[i] === 0) {
                this._dfsUtil(i, end);
                if (this.path[this.pathIndex - 1] === end + 1) {
                    return;
                }
            }
        }
        
        this.pathIndex--;
    }
    
    getPath() {
        return this.path.slice(0, this.pathIndex);
    }
    
    getAdjacencyMatrix() {
        return this.adjMatrix;
    }
}

class GraphUI {
    constructor() {
        this.graph = null;
        this.currentStep = 0; // 0: init, 1: connections, 2: built
        
        this.initDOMReferences();
        this.setupEventListeners();
    }
    
    initDOMReferences() {
        this.vertexCountInput = document.getElementById('vertex-count');
        this.initGraphBtn = document.getElementById('init-graph');
        this.connectionsContainer = document.getElementById('connections-container');
        this.vertexConnectionsDiv = document.getElementById('vertex-connections');
        this.buildGraphBtn = document.getElementById('build-graph');
        this.graphDisplayPanel = document.querySelector('.graph-display');
        this.matrixContainer = document.getElementById('matrix-container');
        this.showMatrixBtn = document.getElementById('show-matrix');
        this.resetGraphBtn = document.getElementById('reset-graph');
        this.graphSearchPanel = document.querySelector('.graph-search');
        this.startVertexSelect = document.getElementById('start-vertex');
        this.endVertexSelect = document.getElementById('end-vertex');
        this.runSearchBtn = document.getElementById('run-search');
        this.searchResultsDiv = document.getElementById('search-results');
        this.bfsResultDiv = document.getElementById('bfs-result');
        this.dfsResultDiv = document.getElementById('dfs-result');
        this.newSearchBtn = document.getElementById('new-search');
        this.consoleDiv = document.getElementById('console');
        this.consoleContent = document.getElementById('console-content');
        this.clearConsoleBtn = document.getElementById('clear-console');
    }
    
    setupEventListeners() {
        this.initGraphBtn.addEventListener('click', () => this.initGraph());
        this.buildGraphBtn.addEventListener('click', () => this.buildGraph());
        this.showMatrixBtn.addEventListener('click', () => this.showMatrix());
        this.resetGraphBtn.addEventListener('click', () => this.resetGraph());
        this.runSearchBtn.addEventListener('click', () => this.runSearch());
        this.newSearchBtn.addEventListener('click', () => this.newSearch());
        this.clearConsoleBtn.addEventListener('click', () => this.clearConsole());
    }
    
    initGraph() {
        const vertexCount = parseInt(this.vertexCountInput.value);
        
        if (isNaN(vertexCount)) {
            this.logToConsole('Por favor, insira um número válido de vértices.', 'error');
            return;
        }
        
        if (vertexCount < 1 || vertexCount > 20) {
            this.logToConsole('O número de vértices deve estar entre 1 e 20.', 'error');
            return;
        }
        
        this.logToConsole(`Inicializando grafo com ${vertexCount} vértices...`, 'info');
        
        // Create connection inputs for each vertex
        this.vertexConnectionsDiv.innerHTML = '';
        
        for (let i = 1; i <= vertexCount; i++) {
            const connectionDiv = document.createElement('div');
            connectionDiv.className = 'vertex-connection';
            connectionDiv.innerHTML = `
                <h4>Vértice ${i}</h4>
                <div class="connection-controls">
                    <div class="form-group connection-input">
                        <label for="vertex-${i}-connections">Conecta com (separados por vírgula):</label>
                        <input type="text" id="vertex-${i}-connections" placeholder="Ex: 2,3,4">
                    </div>
                </div>
            `;
            this.vertexConnectionsDiv.appendChild(connectionDiv);
        }
        
        this.connectionsContainer.classList.remove('hidden');
        this.currentStep = 1;
        this.logToConsole('Defina as conexões para cada vértice e clique em "Construir Grafo".', 'info');
    }
    
    buildGraph() {
        const vertexCount = parseInt(this.vertexCountInput.value);
        this.graph = new Graph(vertexCount);
        
        // Process connections for each vertex
        for (let i = 1; i <= vertexCount; i++) {
            const connectionsInput = document.getElementById(`vertex-${i}-connections`);
            const connectionsText = connectionsInput.value.trim();
            
            if (connectionsText) {
                const connections = connectionsText.split(',').map(c => parseInt(c.trim()));
                
                for (const conn of connections) {
                    if (!isNaN(conn)) {
                        const success = this.graph.addEdge(i, conn);
                        if (!success) {
                            this.logToConsole(`Aviso: Conexão inválida do vértice ${i} para ${conn}. Ignorando.`, 'warning');
                        } else {
                            this.logToConsole(`Adicionada conexão: ${i} ↔ ${conn}`, 'success');
                        }
                    }
                }
            }
        }
        
        this.logToConsole('Grafo construído com sucesso!', 'success');
        
        // Update UI
        this.connectionsContainer.classList.add('hidden');
        this.graphDisplayPanel.classList.remove('hidden');
        this.graphSearchPanel.classList.remove('hidden');
        this.consoleDiv.classList.remove('hidden');
        this.currentStep = 2;
        
        // Populate vertex selects for search
        this.populateVertexSelects();
    }
    
    populateVertexSelects() {
        this.startVertexSelect.innerHTML = '';
        this.endVertexSelect.innerHTML = '';
        
        for (let i = 1; i <= this.graph.V; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            
            this.startVertexSelect.appendChild(option.cloneNode(true));
            this.endVertexSelect.appendChild(option);
        }
    }
    
    showMatrix() {
        const matrix = this.graph.getAdjacencyMatrix();
        const vertexCount = matrix.length;
        
        let tableHTML = `
            <table class="matrix-table">
                <thead>
                    <tr>
                        <th></th>
        `;
        
        // Header row with vertex numbers
        for (let i = 0; i < vertexCount; i++) {
            tableHTML += `<th>${i + 1}</th>`;
        }
        
        tableHTML += `
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Matrix rows
        for (let i = 0; i < vertexCount; i++) {
            tableHTML += `<tr><th>${i + 1}</th>`;
            
            for (let j = 0; j < vertexCount; j++) {
                const cellClass = matrix[i][j] === 1 ? 'connected' : '';
                tableHTML += `<td class="matrix-cell ${cellClass}">${matrix[i][j]}</td>`;
            }
            
            tableHTML += `</tr>`;
        }
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        this.matrixContainer.innerHTML = tableHTML;
        this.matrixContainer.classList.remove('hidden');
        
        this.logToConsole('Matriz de adjacência exibida.', 'info');
    }
    
    runSearch() {
        const startVertex = parseInt(this.startVertexSelect.value);
        const endVertex = parseInt(this.endVertexSelect.value);
        
        if (startVertex === endVertex) {
            this.logToConsole('Os vértices de origem e destino devem ser diferentes.', 'error');
            return;
        }
        
        this.logToConsole(`Executando busca de ${startVertex} para ${endVertex}...`, 'info');
        
        // BFS
        const bfsFound = this.graph.bfs(startVertex - 1, endVertex - 1);
        const bfsPath = this.graph.getPath();
        
        let bfsHTML = '';
        if (bfsFound) {
            bfsHTML = `
                <p class="success-message">✔ Caminho encontrado com BFS!</p>
                <p class="path">${this.formatPath(bfsPath)}</p>
            `;
            this.logToConsole(`BFS: Caminho encontrado: ${bfsPath.join(' → ')}`, 'success');
        } else {
            bfsHTML = `<p class="error-message">✖ Caminho não encontrado com BFS.</p>`;
            this.logToConsole('BFS: Caminho não encontrado.', 'error');
        }
        this.bfsResultDiv.innerHTML = bfsHTML;
        
        // DFS
        const dfsFound = this.graph.dfs(startVertex - 1, endVertex - 1);
        const dfsPath = this.graph.getPath();
        
        let dfsHTML = '';
        if (dfsFound) {
            dfsHTML = `
                <p class="success-message">✔ Caminho encontrado com DFS!</p>
                <p class="path">${this.formatPath(dfsPath)}</p>
            `;
            this.logToConsole(`DFS: Caminho encontrado: ${dfsPath.join(' → ')}`, 'success');
        } else {
            dfsHTML = `<p class="error-message">✖ Caminho não encontrado com DFS.</p>`;
            this.logToConsole('DFS: Caminho não encontrado.', 'error');
        }
        this.dfsResultDiv.innerHTML = dfsHTML;
        
        this.searchResultsDiv.classList.remove('hidden');
    }
    
    formatPath(path) {
        return path.map((v, i) => {
            return i < path.length - 1 
                ? `${v}<span class="path-arrow">→</span>` 
                : v;
        }).join('');
    }
    
    newSearch() {
        this.searchResultsDiv.classList.add('hidden');
        this.logToConsole('Pronto para nova busca.', 'info');
    }
    
    resetGraph() {
        this.graph = null;
        this.currentStep = 0;
        
        // Reset UI
        this.connectionsContainer.classList.add('hidden');
        this.graphDisplayPanel.classList.add('hidden');
        this.graphSearchPanel.classList.add('hidden');
        this.matrixContainer.classList.add('hidden');
        this.searchResultsDiv.classList.add('hidden');
        this.vertexConnectionsDiv.innerHTML = '';
        
        this.logToConsole('Grafo reinicializado. Você pode criar um novo grafo.', 'info');
    }
    
    logToConsole(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `console-message console-${type}`;
        messageDiv.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.consoleContent.appendChild(messageDiv);
        this.consoleContent.scrollTop = this.consoleContent.scrollHeight;
    }
    
    clearConsole() {
        this.consoleContent.innerHTML = '';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const graphUI = new GraphUI();
});