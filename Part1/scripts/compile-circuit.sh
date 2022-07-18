#!/bin/bash

cd circuits

mkdir MerkleTreeRootRecoveryInAlreadyHashedTest

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling MerkleTreeRootRecoveryInAlreadyHashedTest.circom..."

# compile circuit

circom MerkleTreeRootRecoveryInAlreadyHashedTest.circom --r1cs --wasm --sym -o MerkleTreeRootRecoveryInAlreadyHashedTest
snarkjs r1cs info MerkleTreeRootRecoveryInAlreadyHashedTest/MerkleTreeRootRecoveryInAlreadyHashedTest.r1cs

# Start a new zkey and make a contribution

snarkjs groth16 setup MerkleTreeRootRecoveryInAlreadyHashedTest/MerkleTreeRootRecoveryInAlreadyHashedTest.r1cs powersOfTau28_hez_final_10.ptau MerkleTreeRootRecoveryInAlreadyHashedTest/circuit_0000.zkey
snarkjs zkey contribute MerkleTreeRootRecoveryInAlreadyHashedTest/circuit_0000.zkey MerkleTreeRootRecoveryInAlreadyHashedTest/circuit_final.zkey --name="1st Contributor Name" -v -e="random text"
snarkjs zkey export verificationkey MerkleTreeRootRecoveryInAlreadyHashedTest/circuit_final.zkey MerkleTreeRootRecoveryInAlreadyHashedTest/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier MerkleTreeRootRecoveryInAlreadyHashedTest/circuit_final.zkey MerkleTreeRootRecoveryInAlreadyHashedTest/MerkleTreeRootRecoveryInAlreadyHashedTest.sol

mkdir MerkleTreeRootRecoveryInAlreadyHashedTest
cd ../..