const {initClient} = require('./client');
const dashcore = require('@dashevo/dashcore-lib');

const client = initClient();
const {wallet} = client;

const FEE = 1000; // Комиссия в сатоши
const EVO_COLLATERAL = 4000 * 1e8; // 4000 Dash в сатоши
const MASTER_COLLATERAL = 1000 * 1e8; // 1000 Dash в сатоши

async function createCollateralTransaction(nodeType, collateralAddress, fee = FEE) {
  const account = await wallet.getAccount();

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
    .to(collateralAddress, collateralAmount) // Отправляем залог на указанный адрес
    .change(account.getUnusedAddress().address) // Адрес для сдачи
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

  return collateralOutput;
}

// Пример вызова функции
if (require.main === module)
  (async () => {
    try {
      const nodeType = 'evo'; // или 'master'
      const collateralAddress = 'yeB49jSYYp3786GQr7eKFwLNdEqonBf6hm'; // Замените на реальный адрес

      const masternodeOutputs = await createCollateralTransaction(nodeType, collateralAddress);
      console.log('Masternode Outputs:', masternodeOutputs);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      client.disconnect();
    }
  })();
