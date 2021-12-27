var NodeRSA = require('node-rsa');
var fs = require('fs')

var key = new NodeRSA({b: 2048});
var privatePem = key.exportKey("pkcs8-private");
var publicPem = key.exportKey("pkcs8-public-pem");

fs.writeFile('./pem/public.pem', publicPem, (err) => {
if (err) throw err
console.log('公鑰已儲存！')
})
fs.writeFile('./pem/private.pem', privatePem, (err) => {
if (err) throw err
console.log('私鑰已儲存！')
})
