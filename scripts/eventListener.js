const { ethers } = require('ethers')

require('dotenv').config()

const INFURA_API_KEY = process.env.INFURA_API_KEY

const SUSHI_SWAP_CONTRACT_ADDRESS = '0xb5915995366e0331b95107fc6e80beec44bcd0bb'
const SUSHI_SWAP_ABI = require('../constants/SushiSwapABI.json')

const provider = new ethers.WebSocketProvider(
  `wss://polygon-mainnet.infura.io/ws/v3/${INFURA_API_KEY}`
)

// const provider = new ethers.JsonRpcProvider(
//   `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`
// )

const sushiSwapContract = new ethers.Contract(
  SUSHI_SWAP_CONTRACT_ADDRESS,
  SUSHI_SWAP_ABI,
  provider
)

const filter = {
  address: SUSHI_SWAP_CONTRACT_ADDRESS,
  topics: [
    ethers.id('Swap(address,address,int256,int256,uint160,uint128,int24)'),
  ],
  fromBlock: 'latest',
}

console.log('Listening for Swap events...')

provider.on(filter, log => {
  const parsedLog = sushiSwapContract.interface.parseLog(log)
  const { sender, recipient, amount0, amount1 } = parsedLog.args

  if (amount0 && amount0.gte(ethers.BigNumber.from('1000000000000000000'))) {
    console.log(`User ${recipient} swapped`)
  }
})
