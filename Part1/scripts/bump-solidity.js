const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/

let content = fs.readFileSync("./circuits/MerkleTreeRootRecoveryInAlreadyHashedTest/MerkleTreeRootRecoveryInAlreadyHashedTest.sol", { encoding: 'utf-8' });
let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');

fs.writeFileSync("./circuits/MerkleTreeRootRecoveryInAlreadyHashedTest/MerkleTreeRootRecoveryInAlreadyHashedTest.sol", bumped);