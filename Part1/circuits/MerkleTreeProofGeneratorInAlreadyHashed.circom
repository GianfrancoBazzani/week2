pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template MerkleTreeProofGenerator() {
    signal input inHashes[2**3];
    signal output root;
    signal output merkleProof[3];
    
    component Hash2In[(2**3)-1];
    

    for(var i=0; i<((2**3)-1);i++){
        Hash2In[i] = Poseidon(2);
    }


    //Depth level 2
    Hash2In[0].inputs[0] <== inHashes[0];
    Hash2In[0].inputs[1] <== inHashes[1];
    Hash2In[1].inputs[0] <== inHashes[2];
    Hash2In[1].inputs[1] <== inHashes[3];
    Hash2In[2].inputs[0] <== inHashes[4];
    Hash2In[2].inputs[1] <== inHashes[5];
    Hash2In[3].inputs[0] <== inHashes[6];
    Hash2In[3].inputs[1] <== inHashes[7];

    //Depth level 1
    Hash2In[4].inputs[0] <== Hash2In[0].out;
    Hash2In[4].inputs[1] <== Hash2In[1].out;
    Hash2In[5].inputs[0] <== Hash2In[2].out;
    Hash2In[5].inputs[1] <== Hash2In[3].out;

    //Depth level 0
    Hash2In[6].inputs[0] <== Hash2In[4].out;
    Hash2In[6].inputs[1] <== Hash2In[5].out;

    root <== Hash2In[6].out;

    merkleProof[0] <== inHashes[7];
    merkleProof[1] <== Hash2In[2].out;
    merkleProof[2] <== Hash2In[4].out;
    
    //path index 0 1 1 
 
}

component main = MerkleTreeProofGenerator();