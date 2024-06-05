const rp = require("request-promise-native");

const Token = require("../security/token.js");
const Crypto = require("../security/cryptography.js");
const e = require("express");

const bytesToBase64 = async (bytes) => {
  let binary = "";
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const HashPasword = async (password) => {
  const crypto = await new Crypto();
  let salt = await bytesToBase64(await crypto.newSalt());
  var hash = await crypto.crypto(password, salt);
  return {
    salt,
    hash,
  };
};

class User {
  token;

  constructor(token) {
    this.token = token;
  }

  async create(password) {
    let passwordObj = await HashPasword(password);
    console.log(passwordObj);
  }

  login() {}

  forgetPassword(email) {}

  async getByEmail(email) {
    try {
      var options = {
        method: "GET",
        headers: {
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
          Prefer: "odata.include-annotations=*",
        },
        url: `https://newproject.crm.dynamics.com/api/data/v9.2/accounts?$select=emailaddress1,name&$filter=emailaddress1 eq '${email}'`,
        headers: {
          Authorization: "Bearer " + this.token,
        },
      };
      const response = JSON.parse(await rp(options));

      if (response.value.length == 0) return null;
      else return response.value[0];
    } catch (e) {
      return e;
    }
  }
}

module.exports = User;
