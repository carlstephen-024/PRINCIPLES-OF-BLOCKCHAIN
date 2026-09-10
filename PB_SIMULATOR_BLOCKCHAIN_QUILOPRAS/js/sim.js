// Block
class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return CryptoJS.SHA256(
            this.index +
            this.previousHash +
            this.timestamp +
            this.data +
            this.nonce
        ).toString();
    }
}

// Blockchain
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(
            0,
            new Date().toLocaleString(),
            'Genesis Block',
            '0'
        );
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data) {
        const newBlock = new Block(
            this.chain.length,
            new Date().toLocaleString(),
            data,
            this.getLatestBlock().hash
        );

        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 0; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (i > 0) {
                const previousBlock = this.chain[i - 1];
                if (currentBlock.previousHash !== previousBlock.hash) {
                    return false;
                }
            }
        }
        return true;
    }
}

// Instantiate
const blockchain = new Blockchain();

// DOM Elements
const chainEl = document.getElementById('chain');
const statusEl = document.getElementById('status');
const addBlockBtn = document.getElementById('addBlockBtn');
const validateBtn = document.getElementById('validateBtn');
const blockDataInput = document.getElementById('blockData');

// Display function
function renderChain() {
    chainEl.innerHTML = '';

    blockchain.chain.forEach((block, index) => {
        const blockIsValid =
            block.hash === block.calculateHash() &&
            (index === 0 || block.previousHash === blockchain.chain[index - 1].hash);

        const blockDiv = document.createElement('div');
        blockDiv.className = `block ${blockIsValid ? 'valid' : 'invalid'}`;

        blockDiv.innerHTML = `
            <div class="block-header">
                <h3>Block #${block.index}</h3>
                <span class="badge ${blockIsValid ? 'valid' : 'invalid'}">
                    ${blockIsValid ? 'Valid' : 'Invalid'}
                </span>
            </div>

            <div class="field">
                <span class="label">Timestamp</span>
                <div class="value">${block.timestamp}</div>
            </div>

            <div class="field">
                <span class="label">Data</span>
                <div
                    class="value editable-data"
                    contenteditable="true"
                    data-index="${index}"
                >${block.data}</div>
            </div>

            <div class="field">
                <span class="label">Previous Hash</span>
                <div class="value">${block.previousHash}</div>
            </div>

            <div class="field">
                <span class="label">Block Hash</span>
                <div class="value">${block.hash}</div>
            </div>
        `;

        chainEl.appendChild(blockDiv);
    });
}

// Event Delegation for Content Editing (Updates on blur/focusout instead of every keystroke)
chainEl.addEventListener('blur', (e) => {
    if (e.target.classList.contains('editable-data')) {
        const idx = Number(e.target.dataset.index);
        const newText = e.target.innerText.trim();

        if (blockchain.chain[idx].data === newText) return;

        blockchain.chain[idx].data = newText;
        blockchain.chain[idx].hash = blockchain.chain[idx].calculateHash();

        // Recalculate subsequent block hashes
        for (let i = idx + 1; i < blockchain.chain.length; i++) {
            blockchain.chain[i].previousHash = blockchain.chain[i - 1].hash;
            blockchain.chain[i].hash = blockchain.chain[i].calculateHash();
        }

        updateStatus();
        renderChain();
    }
}, true);

// Update Status text
function updateStatus() {
    const valid = blockchain.isChainValid();
    statusEl.textContent = valid ? 'Chain is valid' : 'Chain is invalid';
    statusEl.className = `status ${valid ? 'valid' : 'invalid'}`;
}

// Add Block handler
addBlockBtn.addEventListener('click', () => {
    const data = blockDataInput.value.trim();
    if (!data) return;

    blockchain.addBlock(data);
    blockDataInput.value = '';

    renderChain();
    updateStatus();
});

// Validate button handler
validateBtn.addEventListener('click', () => {
    updateStatus();
});

// Enter key shortcut
blockDataInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addBlockBtn.click();
    }
});

// Initial Render
renderChain();
updateStatus();
