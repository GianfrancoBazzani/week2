pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template MerkleTreeInAlreadyHashedDepth3OnlyTest() {
    signal input inHash[2**3];
    signal output root;

    component Hash2In[(2**3)-1];
    
    for(var i=0; i<((2**3)-1);i++){
        Hash2In[i] = Poseidon(2);
    }


    //Depth level 2
    Hash2In[0].inputs[0] <== inHash[0];
    Hash2In[0].inputs[1] <== inHash[1];
    Hash2In[1].inputs[0] <== inHash[2];
    Hash2In[1].inputs[1] <== inHash[3];
    Hash2In[2].inputs[0] <== inHash[4];
    Hash2In[2].inputs[1] <== inHash[5];
    Hash2In[3].inputs[0] <== inHash[6];
    Hash2In[3].inputs[1] <== inHash[7];

    //Depth level 1
    Hash2In[4].inputs[0] <== Hash2In[0].out;
    Hash2In[4].inputs[1] <== Hash2In[1].out;
    Hash2In[5].inputs[0] <== Hash2In[2].out;
    Hash2In[5].inputs[1] <== Hash2In[3].out;

    //Depth level 0
    Hash2In[6].inputs[0] <== Hash2In[4].out;
    Hash2In[6].inputs[1] <== Hash2In[5].out;

    root <== Hash2In[6].out;
 
}

component main = MerkleTreeInAlreadyHashedDepth3OnlyTest();