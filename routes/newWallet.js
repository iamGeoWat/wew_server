
var express = require('express');
var router = express.Router();
const lightwallet = require('eth-lightwallet');
var ks_to_return;
var json = {
  address: undefined,
  mnemonic: undefined,
  keystore: undefined
};

router.post('/', function(req, res, next) {
  var password = req.body.password;
  
  
  var randomSeed = lightwallet.keystore.generateRandomSeed((Math.random()*100).toString());
  json.mnemonic = randomSeed;
  console.log('generate mnemonic: ')
  console.log(json.mnemonic);
  lightwallet.keystore.createVault({
    password: password,
    seedPhrase: randomSeed,
    //random salt
    salt: 'lightwalletSalt',
    hdPathString: "m/0'/0'/0'"
  }, function (err, ks) {
    ks_to_return = ks;
    json.keystore = ks_to_return.serialize();
    
    
    var numAddr = 1;
    ks_to_return.keyFromPassword(password, function(err, pwDerivedKey) {
      ks_to_return.generateNewAddress(pwDerivedKey, numAddr);
      var addresses = ks_to_return.getAddresses();
      console.log(addresses)
      json.address = addresses[0];
      console.log('json at new address:')
      console.log(json)
  
      
      if (json.address !== undefined && json.mnemonic !== undefined && json.keystore !== undefined) {
        res.send(json);
        console.log('json at send: ')
        console.log(json);
      } else {
        json.address = 'error';
        json.mnemonic = 'error';
        json.keystore = 'error';
        res.send(json);
        console.log('json at send: ')
        console.log(json)
      }
    })
  })
});

module.exports = router;