pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template MerkleTreeDepth4OnlyTest() {
    signal input leaves[2**4];
    signal output root;

    component Hash1In[2**4];
    component Hash2In[(2**4)-1];
    
    for(var i=0; i<2**4;i++){
        Hash1In[i] = Poseidon(1);
        Hash1In[i].inputs[0] <== leaves[i];
    }

    for(var i=0; i<((2**4)-1);i++){
        Hash2In[i] = Poseidon(2);
    }

    //Depth level 3
    Hash2In[0].inputs[0] <== Hash1In[0].out;
    Hash2In[0].inputs[1] <== Hash1In[1].out;
    Hash2In[1].inputs[0] <== Hash1In[2].out;
    Hash2In[1].inputs[1] <== Hash1In[3].out;
    Hash2In[2].inputs[0] <== Hash1In[4].out;
    Hash2In[2].inputs[1] <== Hash1In[5].out;
    Hash2In[3].inputs[0] <== Hash1In[6].out;
    Hash2In[3].inputs[1] <== Hash1In[7].out;
    Hash2In[4].inputs[0] <== Hash1In[8].out;
    Hash2In[4].inputs[1] <== Hash1In[9].out;
    Hash2In[5].inputs[0] <== Hash1In[10].out;
    Hash2In[5].inputs[1] <== Hash1In[11].out;
    Hash2In[6].inputs[0] <== Hash1In[12].out;
    Hash2In[6].inputs[1] <== Hash1In[13].out;
    Hash2In[7].inputs[0] <== Hash1In[14].out;
    Hash2In[7].inputs[1] <== Hash1In[15].out;

    //Depth level 2
    Hash2In[8].inputs[0] <== Hash2In[0].out;
    Hash2In[8].inputs[1] <== Hash2In[1].out;
    Hash2In[9].inputs[0] <== Hash2In[2].out;
    Hash2In[9].inputs[1] <== Hash2In[3].out;
    Hash2In[10].inputs[0] <== Hash2In[4].out;
    Hash2In[10].inputs[1] <== Hash2In[5].out;
    Hash2In[11].inputs[0] <== Hash2In[6].out;
    Hash2In[11].inputs[1] <== Hash2In[7].out;

    //Depth level 1
    Hash2In[12].inputs[0] <== Hash2In[8].out;
    Hash2In[12].inputs[1] <== Hash2In[9].out;
    Hash2In[13].inputs[0] <== Hash2In[10].out;
    Hash2In[13].inputs[1] <== Hash2In[11].out;

    //Depth level 0
    Hash2In[14].inputs[0] <== Hash2In[12].out;
    Hash2In[14].inputs[1] <== Hash2In[13].out;

    root <== Hash2In[14].out;
 
}

component main = MerkleTreeDepth4OnlyTest();