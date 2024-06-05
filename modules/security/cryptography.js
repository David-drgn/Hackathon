var CryptoJS = require("crypto-js");
var Crypto = require("crypto");

class CryptoClass {
  async crypto(value, key) {
    return await CryptoJS.AES.encrypt(value, key).toString();
  }
  async decrypt(value, key) {
    return await CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8);
  }
  async newSalt() {
    return await Crypto.randomBytes(64);
  }
}

module.exports = CryptoClass;
