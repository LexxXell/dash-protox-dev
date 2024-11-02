const { initClient } = require("./client");
const dashcore = require("@dashevo/dashcore-lib");

// async function createProtoxPayload(mnemonic, {
//   addresses: {
//     ownerAddress = null,
//     votingAddress = null,
//     payoutAddress = null,
//     collateralAddress = null,
//     startAddressIndex = 0
//   } = {}
// } = {}) {
//
//
// }

async function getAddresses(ctx, {
  ownerAddress = null,
  votingAddress = null,
  payoutAddress = null,
  collateralAddress = null,
  startAddressIndex = 0
} = {}){
  const account = ctx.account;

  let addressIndex = startAddressIndex;

  // Set to track unique addresses
  const uniqueAddresses = new Set();

  // Helper function to validate and add address to the set
  function addAddress(address) {
    if (uniqueAddresses.has(address)) {
      throw new Error(`Duplicate address detected: ${address}`);
    }
    uniqueAddresses.add(address);
    return address;
  }

  // Assign addresses, generating new ones if they are not provided
  if (!ownerAddress) {
    ownerAddress = addAddress(account.getAddress(addressIndex, 'external').address);
  } else {
    addAddress(ownerAddress); // Validate user-provided address
  }

  if (!votingAddress) {
    addressIndex++;
    votingAddress = addAddress(account.getAddress(addressIndex, 'external').address);
  } else {
    addAddress(votingAddress);
  }

  if (!payoutAddress) {
    addressIndex++;
    payoutAddress = addAddress(account.getAddress(addressIndex, 'external').address);
  } else {
    addAddress(payoutAddress);
  }

  if (!collateralAddress) {
    addressIndex++;
    collateralAddress = addAddress(account.getAddress(addressIndex, 'external').address);
  } else {
    addAddress(collateralAddress);
  }

  // Log addresses for verification
  console.log("Owner Address:", ownerAddress);
  console.log("Voting Address:", votingAddress);
  console.log("Payout Address:", payoutAddress);
  console.log("Collateral Address:", collateralAddress);

  ctx.config = {
    ...ctx.config,
    addresses: {
      ownerAddress,
      votingAddress,
      payoutAddress,
      collateralAddress
    }
  };

  return ctx;
}

async function createCollateralTransaction(ctx) {
  const fee = 1000; // Комиссия в сатоши
  const EVO_COLLATERAL = 4000 * 1e8; // 4000 Dash в сатоши
  const MASTER_COLLATERAL = 1000 * 1e8; // 1000 Dash в сатоши

  const account = ctx.account;

  const nodeType = ctx.config.nodeType;
  // Выбираем размер залога в зависимости от типа ноды
  const collateralAmount = nodeType === 'evo' ? EVO_COLLATERAL : MASTER_COLLATERAL;

  // Получаем все доступные UTXO
  const UTXOs = await account.getUTXOS();
  const totalBalance = UTXOs.reduce((sum, utxo) => sum + utxo.satoshis, 0);

  // Проверяем, хватает ли средств для залога с учетом комиссии
  if (totalBalance < collateralAmount + fee) {
    throw new Error(`Insufficient funds for collateral transaction. (${totalBalance}/${collateralAmount + fee})`);
  }

  // Создаем транзакцию
  const transaction = new dashcore.Transaction()
    .from(UTXOs) // Используем все UTXO для покрытия залога
    .to(ctx.addresses.collateralAddress, collateralAmount) // Отправляем залог на указанный адрес
    .change(ctx.addresses.payoutAddress) // Адрес для сдачи
    .fee(fee); // Устанавливаем комиссию

  // Подписываем транзакцию
  account.sign(transaction);

  // Отправляем транзакцию в сеть
  const txid = await account.broadcastTransaction(transaction);
  console.log(`Transaction broadcasted! TXID: ${txid}`);

  // Получаем masternode outputs
  const collateralOutput = transaction.outputs
    .map((output, index) => ({
      txId: txid,
      outputIndex: index,
      satoshis: output.satoshis,
      address: output.script.toAddress().toString(),
    }))
    .find(output => output.satoshis === collateralAmount);

  console.log("Collateral output:", collateralOutput);

  ctx.config.collateralOutput = collateralOutput;

  return ctx;
}

async function main(mnemonic, {
  nodeType = 'master',
  addresses: {
    ownerAddress = null,
    votingAddress = null,
    payoutAddress = null,
    collateralAddress = null,
    startAddressIndex = 0
  } = {}
} = {}) {
  let ctx = {};
  ctx.config = {nodeType};
  ctx.payload = {};

  const client = initClient(mnemonic);
  const { wallet } = client;
  const account = await wallet.getAccount();

  ctx.client = client;
  ctx.wallet = wallet;
  ctx.account = account;

  ctx = getAddresses(ctx,{
    ownerAddress,
    votingAddress,
    payoutAddress,
    collateralAddress,
    startAddressIndex
  } )

  console.log(JSON.stringify(ctx, null, 2));

  return

  ctx = createCollateralTransaction(ctx);

}

if (require.main === module) {
  require('dotenv').config();
  const mnemonic = process.env.MNEMONIC;

  main(mnemonic)
    .then(console.log)
    .catch(console.error);
}
