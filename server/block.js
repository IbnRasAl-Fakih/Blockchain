const crypto = require('crypto');

class Block {
    constructor(previousHash, data, hash) {
        this.previousHash = previousHash;
        this.data = data;
        this.hash = hash;
    }
}

function createBlock(previousHash, data, hash) {
    return new Block(previousHash, data, hash);
}

class Blockchain {
    constructor() {
        this.chain = [];
    }
}

function createGenesisBlock() {
    return new Block(0, '0', Date.now(), 'Genesis Block', calculateHash('0', 'Genesis Block'));
}

function calculateHash(previousHash, data) {
    return crypto.createHash('sha256').update(previousHash + JSON.stringify(data)).digest('hex');
}

function createNewBlock(data, blockchain) {
    const previousBlock = blockchain.chain[blockchain.chain.length - 1];
    const newHash = calculateHash(previousBlock.hash, data);
    const newBlock = new Block(previousBlock.hash, data, newHash);
    return newBlock;
}

function isChainValid(blockchain) {
    for (let i = 1; i < blockchain.chain.length; i++) {
        const currentBlock = blockchain.chain[i];
        const previousBlock = blockchain.chain[i - 1];
        
        if (currentBlock.hash !== calculateHash(previousBlock.hash, currentBlock.data)) {
        return false;
        }
    }
    return true;
}

function createBlockchain() {
    return new Blockchain;
}

module.exports = { createBlock, createBlockchain, createGenesisBlock, calculateHash, createNewBlock, isChainValid }