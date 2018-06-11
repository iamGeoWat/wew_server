const Web3 = require('web3');
const HookedWeb3Provider = require('hooked-web3-provider');
const lightwallet = require('eth-lightwallet');
var Tx = require('ethereumjs-tx');

// var global_keystore = require('./gvar');

var client_keystore;
var web3 = new Web3();
var keystore;
var rlpTransferTx;
var signedTx;
var json = {
  txhash: undefined,
  fee: '0',
  err: undefined
};

function sendEth(fromAddr, toAddr, valueInEth, gasPrice, gas) {
  var valueInWei = parseFloat(valueInEth)*1.0e18;
  console.log('valueinwei: ' + valueInWei + ' gasprice: ' + gasPrice + ' gas: ' + gas);
  web3.eth.sendTransaction({from: fromAddr, to: toAddr, value: valueInWei, gasPrice: gasPrice, gas: gas}, function (err, txhash) {
    console.log(err);
    console.log('txhash: ' + txhash);
    json.txhash = txhash;
    json.fee = (gas*gasPrice/1.0e18).toString();
    json.err = err.toString();
  })
}

function setWeb3Provider(keystore) {
  var web3Provider = new HookedWeb3Provider({
    host: "https://ropsten.infura.io/KTxDHirVMJjBc0oLkjR2",
    transaction_signer: keystore
  });
  web3.setProvider(web3Provider);
}

function genAddress(password) {
  var numAddr = 1;
  keystore.keyFromPassword(password, function(err, pwDerivedKey) {
    keystore.generateNewAddress(pwDerivedKey, numAddr);
    var serverGenAddr = keystore.getAddresses();
    console.log(serverGenAddr);
  })
}

function genRawTx(toAddr, gas, gasPrice, valueInEth) {
  rlpTransferTx = lightwallet.txutils.valueTx({
    to: toAddr,
    gasLimit: gas.toString().toString('hex'),
    gasPrice: gasPrice.toString().toString('hex'),
    value: (parseFloat(valueInEth) * 1.0e18).toString().toString('hex'),
    nonce: 0
  });
  console.log('not signedtx: ' + rlpTransferTx);
}

function signTx(password, fromAddr) {
  keystore.keyFromPassword(password, function (err, pwDerivedKey) {
    signedTx = lightwallet.signing.signTx(keystore, pwDerivedKey, rlpTransferTx, '0x' + fromAddr.toString('hex'));
    console.log('signedtx: ' + signedTx);
  })
}

function sendTx(signedTx) {
  web3.eth.sendSignedTransaction('0x' + signedTx).on('receipt', console.log);
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
  
  var mnemonic = req.body.mnemonic;
  var password = req.body.password;
  
  client_keystore = lightwallet.keystore.deserialize(req.body.keystore);
  // console.log(client_keystore);
  // if (!ifCustom) {
  //   //TODO: if not custom
  // }
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
      to: '0xD155b0DaBEa1Eb5632dBCB8EE67f48F7876b3254',
      value: '0x00',
      data: ''
    }
    var tx = new Tx(rawTx);
    tx.sign(bufferPK);
    var serializedTx  = tx.serialize();
    console.log(serializedTx.toString());
    console.log('0x' + serializedTx.toString('hex'));
    try{
      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', console.log);
    } catch (err) {
      console.log(err);
    }
    
    
    // lightwallet.keystore.createVault({
  //   password: password,
  //   seedPhrase: mnemonic,
  //   //random salt
  //   hdPathString: "m/0'/0'/0'"
  // }, function (err, ks) {
  //
  //   keystore = ks;
  //   console.log(ks);
  //
  //   genAddress(password);
  //
  //   setWeb3Provider(ks);
  //   console.log('provider is set')
  //
  //   var strPK;
  //   var privateKey;
  //   keystore.keyFromPassword(password, function (err, pwDerivedKey) {
  //     strPK = pwDerivedKey;
  //     console.log('derived key: ' + strPK);
  //     privateKey = keystore.exportPrivateKey(fromAddr, pwDerivedKey);
  //     console.log('pk: ' + privateKey);
  //     privateKey = new Buffer(privateKey, 'hex');
  //     console.log('hex pk' + privateKey.toString());
  //     gasPrice = (web3.utils.toHex(gasPrice.toString())).toString();
  //     gas = (web3.utils.toHex(gas)).toString();
  //     console.log(gas);
  //     console.log(gasPrice);
  //     var rawTx = {
  //       nonce: '0x00',
  //       gasPrice: gasPrice,
  //       gasLimit: gas,
  //       to: '0xD155b0DaBEa1Eb5632dBCB8EE67f48F7876b3254',
  //       value: '0x00',
  //       data: ''
  //     }
  //     var tx = new Tx(rawTx);
  //     tx.sign('0x' + privateKey);
  //     var serializedTx  = tx.serialize();
  //     console.log(serializedTx.toString('hex'));
  //     try{
  //       web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', console.log);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   });

    // genRawTx(toAddr, gas, gasPrice, valueInEth);

    // signTx(password, fromAddr);

    // sendTx(signedTx);


    // var rawTx = {
    //   from: fromAddr,
    //   gasPrice: gasPrice.toString(),
    //   gas: gas,
    //   to: toAddr,
    //   value: (parseFloat(valueInEth)*1.0e18).toString(),
    //   data: ""
    // };
    // var rawTx = {
    //   nonce: '0x00',
    //   gasPrice: '0x09184e72a000',
    //   gasLimit: '0x2710',
    //   to: '0x0000000000000000000000000000000000000000',
    //   value: '0x00',
    //   data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
    // };
    // keystore.keyFromPassword(password, function (err, pwDerivedKey) {
    //   var signedTx = lightwallet.signing.signTx(keystore, pwDerivedKey, rawTx, fromAddr.toString('hex'));
    //   console.log(signedTx);
    // })


    // web3.eth.signTransaction({
    //   from: fromAddr,
    //   gasPrice: gasPrice.toString(),
    //   gas: gas,
    //   to: toAddr,
    //   value: (parseFloat(valueInEth)*1.0e18).toString(),
    //   data: ""
    // }).then(console.log)

    // sendEth(fromAddr, toAddr, valueInEth, gasPrice, gas);
  });
  

  
  // lightwallet.keystore.createVault({
  //   password: password,
  //   seedPhrase: mnemonic,
  //   hdPathString: "m/0'/0'/0'"
  // }, function (err, ks) {
  //   keystore = ks;
  //   genAddress(password);
  //   setWeb3Provider(keystore);
  //   web3.eth.sendTransaction({
  //     from: fromAddr,
  //     to: toAddr,
  //     value: (parseFloat(valueInEth)*1.0e18).toBigNumber(),
  //     gasPrice: gasPrice,
  //     gas: gas
  //   }, function (err, txhash) {
  //     console.log(err);
  //     console.log(txhash);
  //   })
  //   //getbalance
  // })

  
  // setWeb3Provider(keystore);
  // try {
  //   sendEth(fromAddr, toAddr, valueInEth, gasPrice, gas);
  // } catch (err) {
  //   console.log(err);
  // }
  // var intv = setInterval(function () {
  //   if (json.txhash !== undefined || json.err !== undefined) {
  //     res.send(json);
  //     console.log(json);
  //     clearInterval(intv);
  //   } else {
  //     console.log('1s')
  //   }
  // }, 1000)
  
  //TODO: TRY CATCH
});

module.exports = router;
