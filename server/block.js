class Block {
    constructor(previousHash, data, hash) {
        this.previousHash = previousHash;
        this.data = data;
        this.hash = hash;
    }
}

class Blockchain {
    constructor() {
        this.chain = [];
    }

    createGenesisBlock() {
        return new Block(0, '0', Date.now(), 'Genesis Block', this.calculateHash('0', 'Genesis Block'));
    }

    calculateHash(previousHash, data) {
        return crypto.createHash('sha256').update(previousHash + JSON.stringify(data)).digest('hex');
    }

    createNewBlock(data) {
        const previousBlock = this.chain[this.chain.length - 1];
        const newHash = this.calculateHash(previousBlock.hash, data);
        const newBlock = new Block(newIndex, previousBlock.hash, data, newHash);
        this.chain.push(newBlock);
        return newBlock;
    }
    
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            
            if (currentBlock.hash !== this.calculateHash(previousBlock.hash, currentBlock.data)) {
            return false;
            }
        }
        return true;
    }
}