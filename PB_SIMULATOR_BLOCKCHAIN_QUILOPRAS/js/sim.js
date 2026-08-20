// Block
class Block {
    // Setup
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    // Hash
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
    // Setup
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    // Genesis
    createGenesisBlock() {
        return new Block(
            0,
            new Date().toLocaleString(),
            'Genesis Block',
            '0'
        );
    }

    // Latest
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Add
    addBlock(data) {
        const newBlock = new Block(
            this.chain.length,
            new Date().toLocaleString(),
            data,
            this.getLatestBlock().hash
        );

        this.chain.push(newBlock);
    }

    // Validate
    isChainValid() {
        // Check
        for (let i = 0; i < this.chain.length; i++) {

            const currentBlock = this.chain[i];

            // Hash
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            // Previous
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

// Blockchain
const blockchain = new Blockchain();

// Elements
const chainEl = document.getElementById('chain');
const statusEl = document.getElementById('status');
const addBlockBtn = document.getElementById('addBlockBtn');
const validateBtn = document.getElementById('validateBtn');
const blockDataInput = document.getElementById('blockData');

// Display
function renderChain() {
    chainEl.innerHTML = '';

    // Blocks
    blockchain.chain.forEach((block, index) => {

        // Check
        const blockIsValid =
        block.hash === block.calculateHash() &&
        (
            index === 0 ||
            block.previousHash === blockchain.chain[index - 1].hash
        );

        // Create
        const blockDiv = document.createElement('div');
        blockDiv.className = `block ${blockIsValid ? 'valid' : 'invalid'}`;

        // Content
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
                    class="value"
                    contenteditable="true"
                    data-index="${index}"
                    data-field="data"
                >
                    ${block.data}
                </div>
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

    // Edit
    document
        .querySelectorAll('[contenteditable="true"]')
        .forEach(el => {

            // Update
            el.addEventListener('input', e => {
                const idx = Number(e.target.dataset.index);

                blockchain.chain[idx].data =
                    e.target.innerText.trim();

                blockchain.chain[idx].hash =
                    blockchain.chain[idx].calculateHash();

                // Update
                for (
                    let i = idx + 1;
                    i < blockchain.chain.length;
                    i++
                ) {
                    blockchain.chain[i].previousHash =
                        blockchain.chain[i - 1].hash;

                    blockchain.chain[i].hash =
                        blockchain.chain[i].calculateHash();
                }

                // Status
                updateStatus();

                // Display
                renderChain();
            });
        });
}

// Status
function updateStatus() {
    const valid = blockchain.isChainValid();

    statusEl.textContent = valid
        ? 'Chain is valid'
        : 'Chain is invalid';

    statusEl.className = `status ${
        valid ? 'valid' : 'invalid'
    }`;
}

// Add
addBlockBtn.addEventListener('click', () => {
    const data = blockDataInput.value.trim();

    // Check
    if (!data) return;

    // Add
    blockchain.addBlock(data);

    // Clear
    blockDataInput.value = '';

    // Update
    renderChain();
    updateStatus();
});

// Validate
validateBtn.addEventListener('click', () => {
    updateStatus();
});

// Enter
blockDataInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addBlockBtn.click();
    }
});

// Start
renderChain();
updateStatus();