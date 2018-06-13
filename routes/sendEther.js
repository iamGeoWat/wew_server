const Web3 = require('web3');
const HookedWeb3Provider = require('hooked-web3-provider');
const lightwallet = require('../node_modules/eth-lightwallet');
var Tx = require('ethereumjs-tx');


var client_keystore;
var web3 = new Web3();
var keystore;
var json = {
  txhash: undefined,
  fee: '0',
  err: undefined
};

function setWeb3Provider(keystore) {
  var web3Provider = new HookedWeb3Provider({
    host: "https://ropsten.infura.io/KTxDHirVMJjBc0oLkjR2",
    transaction_signer: keystore
  });
  web3.setProvider(web3Provider);
}

function genAddress(password) {
  console.log(password)
  var numAddr = 1;
  keystore.keyFromPassword(password, function(err, pwDerivedKey) {
    console.log(password)
    keystore.generateNewAddress(pwDerivedKey, numAddr);
    var serverGenAddr = keystore.getAddresses();
    console.log(serverGenAddr);
  })
}


var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
  console.log(req.body);
  var gasPriceInGwei = req.body.cGasPriceInGwei;
  var gas = parseInt(req.body.cGas);
  var fromAddr = req.body.fromAddr;
  var toAddr = req.body.toAddr;
  var valueInEth = req.body.valueInEth;
  var ifCustom = req.body.ifCustom;
  
  var password = req.body.password;
  
  client_keystore = lightwallet.keystore.deserialize(req.body.keystore);
  var gasPrice = parseFloat(gasPriceInGwei)*1.0e9;
  console.log(gasPrice);
  
  
  keystore = client_keystore;
  genAddress(password);
  setWeb3Provider(keystore);
  console.log('provider is set')
  var strPK;
  var privateKey;
  keystore.keyFromPassword(password, function (err, pwDerivedKey) {
    strPK = pwDerivedKey;
    console.log('derived key: ' + strPK);
    privateKey = keystore.exportPrivateKey(fromAddr, pwDerivedKey);
    console.log('pk: ' + privateKey);
    var bufferPK = new Buffer(privateKey, 'hex');
    console.log('buffer pk' + bufferPK.toString());
    gasPrice = (web3.utils.toHex(gasPrice.toString())).toString();
    gas = (web3.utils.toHex(gas)).toString();
    console.log(gas);
    console.log(gasPrice);
    var rawTx = {
      nonce: '0x00',
      gasPrice: gasPrice,
      gasLimit: gas,
      to: toAddr,
      value: '0x00',
      data: ''
    }
    var tx = new Tx(rawTx);
    tx.sign(bufferPK);
    var serializedTx = tx.serialize();
    console.log(serializedTx.toString());
    console.log('0x' + serializedTx.toString('hex'));
    try {
      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', console.log);
    } catch (err) {
      console.log(err);
    }
  });
});

module.exports = router;
