const NodeRSA = require('node-rsa');
const fs = require('fs')

var key = new NodeRSA();
key.importKey(fs.readFileSync('./pem/private.pem', 'utf8'), "pkcs8-private");
key.importKey(fs.readFileSync('./pem/public.pem', 'utf8'), "pkcs8-public-pem");
    
module.exports = function decrypt(ciphertext) {
    //解密
    return key.decrypt(ciphertext, 'utf-8');
}