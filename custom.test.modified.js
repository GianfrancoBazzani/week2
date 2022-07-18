const hre = require('hardhat')
const { ethers, waffle } = hre
const { loadFixture } = waffle
const { expect } = require('chai')
const { utils } = ethers

const Utxo = require('../src/utxo')
const { transaction, registerAndTransact, prepareTransaction, buildMerkleTree } = require('../src/index')
const { toFixedHex, poseidonHash } = require('../src/utils')
const { Keypair } = require('../src/keypair')
const { encodeDataForBridge } = require('./utils')

const MERKLE_TREE_HEIGHT = 5
const l1ChainId = 1
const MINIMUM_WITHDRAWAL_AMOUNT = utils.parseEther(process.env.MINIMUM_WITHDRAWAL_AMOUNT || '0.05')
const MAXIMUM_DEPOSIT_AMOUNT = utils.parseEther(process.env.MAXIMUM_DEPOSIT_AMOUNT || '1')

describe('Custom Tests', function () {
  this.timeout(20000)

  async function deploy(contractName, ...args) {
    const Factory = await ethers.getContractFactory(contractName)
    const instance = await Factory.deploy(...args)
    return instance.deployed()
  }

  async function fixture() {
    require('../scripts/compileHasher')
    const [sender, gov, l1Unwrapper, multisig] = await ethers.getSigners()
    const verifier2 = await deploy('Verifier2')
    const verifier16 = await deploy('Verifier16')
    const hasher = await deploy('Hasher')

    const token = await deploy('PermittableToken', 'Wrapped ETH', 'WETH', 18, l1ChainId)
    await token.mint(sender.address, utils.parseEther('10000'))

    const amb = await deploy('MockAMB', gov.address, l1ChainId)
    const omniBridge = await deploy('MockOmniBridge', amb.address)

    /** @type {TornadoPool} */
    const tornadoPoolImpl = await deploy(
      'TornadoPool',
      verifier2.address,
      verifier16.address,
      MERKLE_TREE_HEIGHT,
      hasher.address,
      token.address,
      omniBridge.address,
      l1Unwrapper.address,
      gov.address,
      l1ChainId,
      multisig.address,
    )

    const { data } = await tornadoPoolImpl.populateTransaction.initialize(
      MINIMUM_WITHDRAWAL_AMOUNT,
      MAXIMUM_DEPOSIT_AMOUNT,
    )
    const proxy = await deploy(
      'CrossChainUpgradeableProxy',
      tornadoPoolImpl.address,
      gov.address,
      data,
      amb.address,
      l1ChainId,
    )

    const tornadoPool = tornadoPoolImpl.attach(proxy.address)

    await token.approve(tornadoPool.address, utils.parseEther('10000'))

    return { tornadoPool, token, proxy, omniBridge, amb, gov, multisig }
  }

  it('[assignment] ii. deposit 0.1 ETH in L1 -> withdraw 0.08 ETH in L2 -> assert balances', async () => {
    const { tornadoPool, token, omniBridge } = await loadFixture(fixture)
    const aliceKeypair = new Keypair()

    // Alice deposits into tornado pool
    const aliceDepositAmount = utils.parseEther('0.1')
    const aliceDepositUtxo = new Utxo({ amount: aliceDepositAmount, keypair: aliceKeypair })
    const { args, extData } = await prepareTransaction({
      tornadoPool,
      outputs: [aliceDepositUtxo],
    })

    const onTokenBridgedData = encodeDataForBridge({
      proof: args,
      extData,
    })

    const onTokenBridgedTx = await tornadoPool.populateTransaction.onTokenBridged(
      token.address,
      aliceDepositUtxo.amount,
      onTokenBridgedData,
    )
    // emulating bridge. first it sends tokens to omnibridge mock then it sends to the pool
    await token.transfer(omniBridge.address, aliceDepositAmount)
    const transferTx = await token.populateTransaction.transfer(tornadoPool.address, aliceDepositAmount)

    await omniBridge.execute([
      { who: token.address, callData: transferTx.data }, // send tokens to pool
      { who: tornadoPool.address, callData: onTokenBridgedTx.data }, // call onTokenBridgedTx
    ])

    // Alice withdraws a part of his funds from the shielded pool
    const aliceWithdrawAmount = utils.parseEther('0.08')
    const aliceEthAddress = '0xDeaD00000000000000000000000000000000BEEf'
    const aliceChangeUtxo = new Utxo({ amount: aliceDepositAmount.sub(aliceWithdrawAmount), keypair: aliceKeypair })
    await transaction({
      tornadoPool,
      inputs: [aliceDepositUtxo],
      outputs: [aliceChangeUtxo],
      recipient: aliceEthAddress,
    })
 
     const aliceBalance = await token.balanceOf(aliceEthAddress)
     console.log("  Alice L2 balance = ",ethers.utils.formatEther(aliceBalance))
     expect(aliceBalance).to.be.equal(aliceWithdrawAmount)

     const filter = tornadoPool.filters.NewCommitment()
     const fromBlock = await ethers.provider.getBlock()
     const events = await tornadoPool.queryFilter(filter, fromBlock.number)
 
     let aliceReceiveUtxo
     try {
       aliceReceiveUtxo = Utxo.decrypt(
         aliceDepositUtxo.keypair,
         events[0].args.encryptedOutput,
         events[0].args.index,
       )
     } catch (e) {
       // we try to decrypt another output here because it shuffles outputs before sending to blockchain
       aliceReceiveUtxo = Utxo.decrypt(
         aliceDepositUtxo.keypair,
         events[1].args.encryptedOutput,
         events[1].args.index,
       )
     }
     console.log("  Alice tornado pool balance =",ethers.utils.formatEther(aliceReceiveUtxo.amount));
     expect(aliceReceiveUtxo.amount).to.be.equal(ethers.utils.parseEther('0.02'))


    const omniBridgeBalance = await token.balanceOf(omniBridge.address)
    console.log("  Alice omnibridge balance = ", ethers.utils.formatEther(omniBridgeBalance))
    expect(omniBridgeBalance).to.be.equal(0)
  })

  it('[assignment] iii. see assignment doc for details', async () => {
    const { tornadoPool, token, omniBridge } = await loadFixture(fixture)
    const aliceKeypair = new Keypair()
    const bobKeypair = new Keypair()
    const bobAddress = bobKeypair.address() // contains only public key

    console.log("  Alice deposit and sends to L2 ")
    // Alice deposits into tornado pool
    const aliceDepositAmount = utils.parseEther('0.13')
    const aliceDepositUtxo = new Utxo({ amount: aliceDepositAmount, keypair: aliceKeypair })
    const { args, extData } = await prepareTransaction({
      tornadoPool,
      outputs: [aliceDepositUtxo],
    })

    const onTokenBridgedData = encodeDataForBridge({
      proof: args,
      extData,
    })

    const onTokenBridgedTx = await tornadoPool.populateTransaction.onTokenBridged(
      token.address,
      aliceDepositUtxo.amount,
      onTokenBridgedData,
    )
    // emulating bridge. first it sends tokens to omnibridge mock then it sends to the pool
    await token.transfer(omniBridge.address, aliceDepositAmount)
    const transferTx = await token.populateTransaction.transfer(tornadoPool.address, utils.parseEther('0.06'))

    await omniBridge.execute([
      { who: token.address, callData: transferTx.data }, // send tokens to pool
      { who: tornadoPool.address, callData: onTokenBridgedTx.data }, // call onTokenBridgedTx
    ])

       
    const omniBridgeBalance = await token.balanceOf(omniBridge.address)
    console.log("  Alice omnibridge balance = ", ethers.utils.formatEther(omniBridgeBalance))
	// i don had time to end this part
  })
})
