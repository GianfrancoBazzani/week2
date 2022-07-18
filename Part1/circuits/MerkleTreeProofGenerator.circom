pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template MerkleTreeProofGenerator() {
    signal input leaves[2**3];
    signal output root;
    signal output merkleProof[3];
    
    component Hash1In[2**3];
    component Hash2In[(2**3)-1];
    
    for(var i=0; i<2**3;i++){
        Hash1In[i] = Poseidon(1);
        Hash1In[i].inputs[0] <== leaves[i];
    }

    for(var i=0; i<((2**3)-1);i++){
        Hash2In[i] = Poseidon(2);
    }


    //Depth level 2
    Hash2In[0].inputs[0] <== Hash1In[0].out;
    Hash2In[0].inputs[1] <== Hash1In[1].out;
    Hash2In[1].inputs[0] <== Hash1In[2].out;
    Hash2In[1].inputs[1] <== Hash1In[3].out;
    Hash2In[2].inputs[0] <== Hash1In[4].out;
    Hash2In[2].inputs[1] <== Hash1In[5].out;
    Hash2In[3].inputs[0] <== Hash1In[6].out;
    Hash2In[3].inputs[1] <== Hash1In[7].out;

    //Depth level 1
    Hash2In[4].inputs[0] <== Hash2In[0].out;
    Hash2In[4].inputs[1] <== Hash2In[1].out;
    Hash2In[5].inputs[0] <== Hash2In[2].out;
    Hash2In[5].inputs[1] <== Hash2In[3].out;

    //Depth level 0
    Hash2In[6].inputs[0] <== Hash2In[4].out;
    Hash2In[6].inputs[1] <== Hash2In[5].out;

    root <== Hash2In[6].out;

    merkleProof[0] <== Hash1In[7].out;
    merkleProof[1] <== Hash2In[2].out;
    merkleProof[2] <== Hash2In[4].out;
    
    //path index 0 1 1 
 
}

component main = MerkleTreeProofGenerator();