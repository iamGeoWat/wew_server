const Web3 = require('web3');
// const HookedWeb3Provider = require('hooked-web3-provider');
// const lightwallet = require('eth-lightwallet');
// var global_keystore = require('./gvar');

var json = {
  balance: 'Updating...',
  blockHeight: 'Updating...'
};
var web3 = new Web3();

// function setWeb3Provider(keystore) {
//   var web3Provider = new HookedWeb3Provider({
//     host: "https://ropsten.infura.io/229aWctOEOCfm1rjMbVm",
//     transaction_signer: keystore
//   });
//   web3.setProvider(web3Provider);
// }

var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
  console.log(req.body);
  var address = req.body.address;
  // var client_keystore = lightwallet.keystore.deserialize(req.body.keystore);
  // setWeb3Provider(client_keystore);
  web3.setProvider(new web3.providers.HttpProvider('https://ropsten.infura.io/229aWctOEOCfm1rjMbVm'));
  web3.eth.getBalance(address).then(function(data1) {
    console.log(data1);
    json.balance = data1/1.0e18;
    web3.eth.getBlockNumber().then(function (data2) {
      console.log(data2);
      json.blockHeight = data2;
      console.log(json);
      res.send(json);
    })
  })
  // json.balance = web3.eth.getBalance(address)/1.0e18;
  // console.log(json);
});

module.exports = router;
