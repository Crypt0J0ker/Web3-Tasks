const { ethers } = require('ethers')
require('dotenv').config()

const INFURA_API_KEY = process.env.INFURA_API_KEY

const SUSHI_SWAP_CONTRACT_ADDRESS = '0xb5915995366e0331b95107fc6e80beec44bcd0bb'
const SUSHI_SWAP_ABI = require('../constants/SushiSwapABI.json')

const provider = new ethers.JsonRpcProvider(
  `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`
)

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
  fromBlock: 57735447,
  toBlock: 'latest',
}

const userAddress = '0xE55cb377EF32e69cEdF38FC536e844E761E82E88'

async function checkUserSwaps() {
  try {
    console.log('Fetching Swap events...')
    const logs = await provider.getLogs(filter)
    console.log(`Fetched ${logs.length} events.`)

    const parsedLogs = logs.map(log =>
      sushiSwapContract.interface.parseLog(log)
    )
    const userSwaps = parsedLogs.filter(
      log =>
        log.args.recipient.toLowerCase() === userAddress.toLowerCase() &&
        log.args.amount0.toString() >= '1000000000000000000'
    )

    if (userSwaps.length > 0) {
      console.log(`User ${userAddress} participated in the following swaps:`)
      userSwaps.forEach((log, index) => {
        console.log(`Swap ${index + 1}:`)
        console.log(`Sender: ${log.args.sender}`)
        console.log(`Recipient: ${log.args.recipient}`)
        console.log(`Amount0: ${log.args.amount0.toString()}`)
        console.log(`Amount1: ${log.args.amount1.toString()}`)
      })
    } else {
      console.log(`User ${userAddress} did not participate in any swaps.`)
    }
  } catch (error) {
    console.error('Error fetching logs:', error)
  }
}

checkUserSwaps()
