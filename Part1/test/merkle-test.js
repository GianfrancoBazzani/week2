const { poseidonContract } = require("circomlibjs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { groth16 } = require("snarkjs");
const wasm_tester = require("circom_tester").wasm;
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("MerkleTree", function () {
    let merkleTree;

    beforeEach(async function () {
       
    });
    it("Circuit test: Should calculate correctly the Merkle root from leaves list, test with depth = 3", async function(){
        console.log("----------------------CIRCUITS TESTS----------------------");
        //Compute the root with test circuit, manual connected all signals of the hashes for depth = 3 merkle tree 
        const circuit1 = await wasm_tester("circuits/MerkleTreeDepth3OnlyTest.circom");
        const INPUT1 = {
            "leaves": [1,2,3,4,5,6,7,8]
        }
        const proof1 = await circuit1.calculateWitness(INPUT1, true); 
        console.log("   Manually connected depth 3 only Merkle tree circuit ");
        console.log("   input leaves = ", INPUT1.leaves.toString(),"\n","  root =", proof1[1]); //root result = 12926426738483865258950692701584522114385179899773452321739143007058691921961n

        //Compute merkle root using geneal merkle tree circuit with n=3 
        const circuit2 = await wasm_tester("circuits/MerkleTreeTestN3.circom");
        const INPUT2 = {
            "leaves": [1,2,3,4,5,6,7,8]
        }

        const proof2 = await circuit2.calculateWitness(INPUT2, true); 
        console.log("   General depth Merkle Tree circuit, set depth to 3");
        console.log("   input leaves = ", INPUT2.leaves.toString(),"\n","  root =", proof2[1]);

        expect(proof1[1]).to.equal(proof2[1]);
        
    });

    it("Circuit test: Should calculate correctly the merkle root from leaves list, test with depth = 4", async function(){

        //Compute the root with test circuit, manual connected all signals of the hashes for depth = 4 merkle tree 
        const circuit1 = await wasm_tester("circuits/MerkleTreeDepth4OnlyTest.circom");
        const INPUT1 = {
            "leaves": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
        }
        const proof1 = await circuit1.calculateWitness(INPUT1, true); 
        console.log("   Manually connected depth 4 only merkle tree circuit");
        console.log("   input leaves = ", INPUT1.leaves.toString(),"\n","  root =", proof1[1]); //root result = 12849909573197439023386719626541092579807164430016488237755007164956786115756n

        //Compute merkle root using geneal merkle tree circuit with n=4
        const circuit2 = await wasm_tester("circuits/MerkleTreeTestN4.circom");
        const INPUT2 = {
            "leaves": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
        }

        const proof2 = await circuit2.calculateWitness(INPUT2, true); 
        console.log("   General depth Merkle Tree circuit, set depth to 4");
        console.log("   input leaves = ", INPUT2.leaves.toString(),"\n","  root =", proof2[1]);

        expect(proof1[1]).to.equal(proof2[1]);
        
    });
    it("Circuit test: Should recovery correctly the root from a merkle path",async function(){
        console.log("   Generating Merkle proof");
        const circuit1 = await wasm_tester("circuits/MerkleTreeProofGenerator.circom");
        const INPUT1 = {
            "leaves": [1,2,3,4,5,6,7,8]
        }
        const proof1 = await circuit1.calculateWitness(INPUT1, true);
        console.log("   input leaves = ", INPUT1.leaves.toString(),"\n","  root =", proof1[1]); //root result = 12926426738483865258950692701584522114385179899773452321739143007058691921961n
        console.log("   Merkle proof:")
        console.log(proof1.slice(2,5));
        var pathIndex = [0,1,1];
        console.log("   path index = ", pathIndex);

        console.log("   Recovering the root");
        const circuit2 = await wasm_tester("circuits/MerkleTreeRootRecoveryTest.circom");
        const INPUT2 = {
            "leaf": 7,
            "path_elements" : proof1.slice(2,5),
            "path_index"    : pathIndex
        }
        const proof2 = await circuit2.calculateWitness(INPUT2, true);
        console.log("   recovered root =", proof2[1] );

        expect(proof1[1]).to.equal(proof2[1]);

    });    
    it("Circuit test: Should calculate correctly the Merkle root from leaves list, test with depth = 3 (Already hashed inputs)", async function(){

        //Compute the root with test circuit, manual connected all signals of the hashes for depth = 3 merkle tree 
        const circuit1 = await wasm_tester("circuits/MerkleTreeInAlreadyHashedDepth3OnlyTest.circom");
        const INPUT1 = {
            "inHash": [1,2,3,4,5,6,7,8]
        }
        const proof1 = await circuit1.calculateWitness(INPUT1, true); 
        console.log("   Manually connected depth 3 only Merkle tree circuit ");
        console.log("   input Hashes = ", INPUT1.inHash.toString(),"\n","  root =", proof1[1]); //root result = 14629452129687363793084585378194807561782241384488665279773588974567494940279n

        //Compute merkle root using geneal merkle tree circuit with n=3 
        const circuit2 = await wasm_tester("circuits/MerkleTreeInAlreadyHashedTestN3.circom");
        const INPUT2 = {
            "inHash": [1,2,3,4,5,6,7,8]
        }

        const proof2 = await circuit2.calculateWitness(INPUT2, true); 
        console.log("   General depth Merkle Tree circuit, set depth to 3");
        console.log("   input Hashes = ", INPUT2.inHash.toString(),"\n","  root =", proof2[1]);

        expect(proof1[1]).to.equal(proof2[1]);
        
    });
    it("Circuit test: Should calculate correctly the Merkle root from leaves list, test with depth = 4(Already hashed inputs)", async function(){

        //Compute the root with test circuit, manual connected all signals of the hashes for depth = 4 merkle tree 
        const circuit1 = await wasm_tester("circuits/MerkleTreeInAlreadyHashedDepth4OnlyTest.circom");
        const INPUT1 = {
            "inHash": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
        }
        const proof1 = await circuit1.calculateWitness(INPUT1, true); 
        console.log("   Manually connected depth 4 only Merkle tree circuit ");
        console.log("   input Hashes = ", INPUT1.inHash.toString(),"\n","  root =", proof1[1]); //root result = 21013571166917622537724770309050693131274168214955073041334585836894534334888n


        //Compute merkle root using geneal merkle tree circuit with n=4
        const circuit2 = await wasm_tester("circuits/MerkleTreeInArleadyHashedTestN4.circom");
        const INPUT2 = {
            "inHash": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
        }

        const proof2 = await circuit2.calculateWitness(INPUT2, true); 
        console.log("   General depth Merkle Tree circuit, set depth to 4");
        console.log("   input Hashes = ", INPUT2.inHash.toString(),"\n","  root =", proof2[1]);

        expect(proof1[1]).to.equal(proof2[1]);
        
    });
    it("Circuit test: Should recovery correctly the root from a merkle path (Already hashed inputs)",async function(){
        console.log("   Generating Merkle proof");
        const circuit1 = await wasm_tester("circuits/MerkleTreeProofGeneratorInAlreadyHashed.circom");
        const INPUT1 = {
            "inHashes": [1,2,3,4,5,6,7,8]
        }
        const proof1 = await circuit1.calculateWitness(INPUT1, true);
        console.log("   input Hashes = ", INPUT1.inHashes.toString(),"\n","  root =", proof1[1]); //root result = 14629452129687363793084585378194807561782241384488665279773588974567494940279n
        console.log("   Merkle proof:")
        console.log(proof1.slice(2,5));
        var pathIndex = [0,1,1];
        console.log("   path index = ", pathIndex);

        console.log("   Recovering the root");
        const circuit2 = await wasm_tester("circuits/MerkleTreeRootRecoveryInAlreadyHashedTest.circom");
        const INPUT2 = {
            "leafHash": 7,
            "path_elements" : proof1.slice(2,5),
            "path_index"    : pathIndex
        }
        const proof2 = await circuit2.calculateWitness(INPUT2, true);
        console.log("   recovered root =", proof2[1] );

        expect(proof1[1]).to.equal(proof2[1]);

    });
    
    it("Contracts test: Insert two new leaves and verify the first leaf in an inclusion proof", async function () {
        console.log("----------------------CONTRACTS TESTS----------------------");
        console.log("   *Deploying Poseidon hash smart contract 2 inputs");
        const PoseidonT3 = await ethers.getContractFactory(
            poseidonContract.generateABI(2),
            poseidonContract.createCode(2)
        )
        const poseidonT3 = await PoseidonT3.deploy();
        await poseidonT3.deployed();

        console.log("   *Deploying Poseidon hash smart contract 1 inputs");
        const PoseidonT31In = await ethers.getContractFactory(
            poseidonContract.generateABI(1),
            poseidonContract.createCode(1)
        )
        const poseidonT31In = await PoseidonT31In.deploy();
        await poseidonT31In.deployed();

        console.log("   *Deploying Merkle tree contract");
        const MerkleTree = await ethers.getContractFactory("MerkleTree", {
            libraries: {
                PoseidonT3: poseidonT3.address,
                PoseidonT31In: poseidonT31In.address
            },
          });
        merkleTree = await MerkleTree.deploy();
        await merkleTree.deployed();
    
        console.log("   *Inserting leaves(Hashed)")
        await merkleTree.insertLeaf(1);
        await merkleTree.insertLeaf(2);
        contractRoot = await merkleTree.root();
        console.log("    Root returned by the contract =", contractRoot.toString());

        const node9 = (await merkleTree.hashes(9)).toString();
        const node13 = (await merkleTree.hashes(13)).toString();
        
        console.log("   *Verify leaf 0 off chain using .wasam circuit");
        const Input = {
            "leafHash": "1",
            "path_elements": ["2", node9, node13],
            "path_index": ["0", "0", "0"]
        }


        const { proof, publicSignals } = await groth16.fullProve(Input, "circuits/MerkleTreeRootRecoveryInAlreadyHashedTest/MerkleTreeRootRecoveryInAlreadyHashedTest_js/MerkleTreeRootRecoveryInAlreadyHashedTest.wasm","circuits/MerkleTreeRootRecoveryInAlreadyHashedTest/circuit_final.zkey");
        
        console.log("    computed root =", publicSignals[0]);

        console.log("   *Verify computatuion proof onchain")
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const input = argv.slice(8);

        expect(await merkleTree.verify(a, b, c, input)).to.be.true;
        console.log("    verification ok ✅ ")
        /*
        console.log("   *Verify leaf 1 off chain using .wasam circuit");
        const Input1 = {
            "leafHash": "2",
            "path_elements": ["1", node9, node13],
            "path_index": ["1", "0", "0"]
        }
  
        const { proof1, publicSignals1 } = await groth16.fullProve(Input1, "circuits/MerkleTreeRootRecoveryInAlreadyHashedTest/MerkleTreeRootRecoveryInAlreadyHashedTest_js/MerkleTreeRootRecoveryInAlreadyHashedTest.wasm","circuits/MerkleTreeRootRecoveryInAlreadyHashedTest/circuit_final.zkey");
        
        console.log("    computed root =", publicSignals1[0]);

        console.log("   *Verify computatuion proof onchain")
        const calldata1 = await groth16.exportSolidityCallData(proof1, publicSignals1);
    
        const argv1 = calldata1.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        const a1 = [argv1[0], argv1[1]];
        const b1 = [[argv1[2], argv1[3]], [argv1[4], argv1[5]]];
        const c1 = [argv1[6], argv1[7]];
        const input1 = argv1.slice(8);

        expect(await merkleTree.verify(a1, b1, c1, input1)).to.be.true;
        console.log("    verification ok ✅ ")
        */
    });
    
});
