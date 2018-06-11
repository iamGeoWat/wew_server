// var global_keystore = require('./gvar');

function newWallet(password) {
  var randomSeed = lightwallet.keystore.generateRandomSeed((Math.random()*100).toString());
  json.mnemonic = randomSeed;
  lightwallet.keystore.createVault({
    password: password,
    seedPhrase: randomSeed,
    //random salt
    hdPathString: "m/0'/0'/0'"
  }, function (err, ks) {
    ks_to_return = ks;
    // global_keystore = ks;
    // console.log('aaaaaaa')
    console.log(ks);
    json.keystore = ks_to_return.serialize();
    newAddresses(password);
    // setWeb3Provider(global_keystore);
    // getBalances();
  })
}

function newAddresses(password) {
  var numAddr = 1;
  ks_to_return.keyFromPassword(password, function(err, pwDerivedKey) {
    ks_to_return.generateNewAddress(pwDerivedKey, numAddr);
    var addresses = ks_to_return.getAddresses();
    console.log(addresses)
    json.address = addresses[0];
    console.log(json)
    // getBalances();
  })
}

var express = require('express');
var router = express.Router();
const lightwallet = require('eth-lightwallet');
var ks_to_return;
var json = {
  address: 'Error: not generated.',
  mnemonic: 'Error: not generated.',
  keystore: 'Error: not generated.'
};

router.post('/', function(req, res, next) {
  var data = {
    password: req.body.password
  };
  newWallet(data.password);
  while (true) {
    if (json.address !== undefined && json.mnemonic !== undefined && json.keystore !== undefined) {
      res.send(json);
      console.log(json);
      break;
    }
  }
});

module.exports = router;
