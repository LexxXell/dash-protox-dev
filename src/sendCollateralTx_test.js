const {initClient} = require('./client');

const dashcore = require("@dashevo/dashcore-lib");

const fee = 1000; // Устанавливаем фиксированную комиссию (например, 1000 сатоши)

const client = initClient();

const {wallet} = client;

const EVO_COLLATERAL=4000;
const MASTER_COLLATERAL=1000;

async function getAddresses() {
  const account = await wallet.getAccount();

  const addresses = account.getAddresses('external');

  console.log(Object.values(addresses).slice(5,9).map(address => address.address).join('\n'));
}

async function getUTXOs() {
  const account = await wallet.getAccount();
  const UTXOs = await account.getUTXOS();

  console.log(UTXOs.map(utxo => utxo.address.toString()).join('\n'));
}

async function createAndSendTransaction() {
  const account = await wallet.getAccount();

  // Получаем все UTXO
  const UTXOs = await account.getUTXOS();

  // Проверка, что есть хотя бы один UTXO для создания транзакции
  if (UTXOs.length === 0) {
    console.error('No UTXOs available to create transaction');
    return;
  }

  // Получаем адрес для отправки (можем использовать неиспользованный адрес из аккаунта)
  const recipientAddress = account.getUnusedAddress().address;
  console.log(`Recipient Address: ${recipientAddress}`);

  // Считаем общую сумму в сатоши и комиссию
  const totalAmount = UTXOs.reduce((sum, utxo) => sum + utxo.satoshis, 0);
  const amountToSend = totalAmount - fee;

  if (amountToSend <= 0) {
    console.error('Insufficient funds for transaction fee');
    return;
  }

  // Создаем транзакцию
  const transaction = new dashcore.Transaction()
    .from(UTXOs)                 // Используем все UTXO
    .to(recipientAddress, amountToSend) // Отправляем сумму на новый адрес
    .change(recipientAddress)     // Адрес для сдачи
    .fee(fee);                    // Устанавливаем комиссию

  // Подписываем транзакцию
  account.sign(transaction);

  // Отправляем транзакцию в сеть
  const txid = await account.broadcastTransaction(transaction);
  console.log(`Transaction broadcasted! TXID: ${txid}`);
}

getUTXOs().catch(console.error).finally(() => {client.disconnect();});