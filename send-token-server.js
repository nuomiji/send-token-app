const fs = require('fs');
const Tx = require('ethereumjs-tx');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/vCfQu4uCspVZEATQTcmJ'));

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/send', (req, res) => {
    var myAddress = req.body.fromAddress;
    var myPrivateKey = req.body.fromPrivateKey;
    var toAddress = req.body.toAddress;
    var amount = req.body.amount;


    var count = web3.eth.getTransactionCount(myAddress);
    var abiArray = JSON.parse(fs.readFileSync('abi.json', 'utf-8'));
    var contractAddress = "0x14466590b32b83BE64898fD8b70E1a050DA0a9D0";
    var contract = web3.eth.contract(abiArray).at(contractAddress);

    var rawTransaction = {
        "from": "myAddress",
        "nonce": web3.toHex(count),
        "gasPrice": web3.toHex(4),
        "gasLimit": web3.toHex(41000),
        "to": contractAddress,
        "value": web3.toHex(0),
        "data": contract.transfer.getData(toAddress, amount, {from: "myAddress"}),
        "chainId": 0x03
    };

    var privKey = new Buffer(myPrivateKey, 'hex');
    var tx = new Tx(rawTransaction);

    tx.sign(privKey);
    var serializedTx = tx.serialize();

    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (!err){
            console.log(hash);
            res.redirect('https://ropsten.etherscan.io/tx/' + hash);
            // res.send("Success! Your transaction hash is " + hash);
        }
        else
            console.log(err);
    });

});


var port = 8080;
app.listen(port, () => console.log("Listening on port " + port));

