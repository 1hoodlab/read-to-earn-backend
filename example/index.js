const ethers = require('ethers');

async function main() {
  const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s3.binance.org:8545');

  let data = await provider.getTransactionReceipt('0xa93280c797a968d027defb0bc3580246f37f6bb13bfd5e028e2cdf69035f6cac');
  let abi = ['event CreateNews(uint256 indexed tokenId,address indexed ownerAddress,string slug,uint256 totalSupply,uint8 paymentToken)'];

  const iface = new ethers.utils.Interface(abi);
  let [tokenId, ownerAddress, slug, totalSupply, paymentToken] = iface.parseLog(data.logs[data.logs.length - 1]).args;

  console.log(tokenId.toNumber());
}

main();
