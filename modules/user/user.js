const rp = require("request-promise-native");

const Token = require("../security/token.js");
const Crypto = require("../security/cryptography.js");

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
  let hash = await crypto.crypto(password, salt);
  return {
    salt,
    hash,
  };
};

const Descrypto = async (hash, salt) => {
  const crypto = await new Crypto();
  let password = await crypto.decrypt(hash, salt);
  return password;
};

class User {
  token;

  constructor(token) {
    this.token = token;
  }

  async create(name, email, password, telephone, document) {
    try {
      let passwordObj = await HashPasword(password);

      let record = {};

      record.name = name;
      record.emailaddress1 = email;
      record.new_password = passwordObj.hash;
      record.new_salt = passwordObj.salt;
      record.telephone1 = telephone;
      record.new_document = document;

      return new Promise((resolve, reject) => {
        fetch(
          `${process.env.BASE_REQUEST_URL}/api/data/v9.2/accounts?$select=emailaddress1,name,new_tipodaconta`,
          {
            method: "POST",
            headers: {
              "OData-MaxVersion": "4.0",
              "OData-Version": "4.0",
              "Content-Type": "application/json; charset=utf-8",
              Accept: "application/json",
              Prefer: "odata.include-annotations=*,return=representation",
              Authorization: "Bearer " + this.token,
            },
            body: JSON.stringify(record),
          }
        )
          .then(function success(response) {
            return response.json().then((json) => {
              if (response.ok) {
                return [response, json];
              } else {
                throw json.error;
              }
            });
          })
          .then(async function (responseObjects) {
            var response = responseObjects[0];
            var responseBody = responseObjects[1];
            var result = responseBody;
            console.log(result);
            // Columns
            var accountid = result["accountid"]; // Guid
            var emailaddress1 = result["emailaddress1"]; // Text
            var name = result["name"]; // Text
            var new_tipodaconta = result["new_tipodaconta"]; // Choice
            var new_tipodaconta_formatted =
              result[
                "new_tipodaconta@OData.Community.Display.V1.FormattedValue"
              ];

            let token = await new Token().createToken(
              {
                user: {
                  accountid,
                  emailaddress1,
                  name,
                  new_tipodaconta,
                  new_tipodaconta_formatted,
                },
              },
              false
            );
            resolve({
              erro: false,
              message: "Cadastro realizado com sucesso",
              token,
            });
          })
          .catch(function (e) {
            resolve({
              erro: true,
              message:
                "Ocorreu algum erro inesperado, por favor, tente novamente",
              e,
            });
          });
      });
    } catch (e) {
      console.log(e);
    }
  }

  async login(email, password, check) {
    const user = await this.getByEmail(email);

    if (!user) {
      throw new Error("Login não encontrado");
    }

    if ((await Descrypto(user.new_password, user.new_salt)) == password) {
      delete user.new_salt;
      delete user.new_password;
      const returnToken = await new Token().createToken(
        {
          user,
        },
        check
      );
      return returnToken;
    } else throw new Error("Login ou senha incorretos");
  }

  forgetPassword(email) {}

  async getByEmail(email) {
    try {
      let options = {
        method: "GET",
        headers: {
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
          Prefer: "odata.include-annotations=*",
        },
        url: `${process.env.BASE_REQUEST_URL}/api/data/v9.2/accounts?$select=emailaddress1,name,new_password,new_salt,new_tipodaconta&$filter=emailaddress1 eq '${email}'`,
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

  async getByDocument(doc) {
    try {
      let options = {
        method: "GET",
        headers: {
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
          Prefer: "odata.include-annotations=*",
        },
        url: `${process.env.BASE_REQUEST_URL}/api/data/v9.2/accounts?$select=emailaddress1,name,new_password,new_salt&$filter=new_document eq '${doc}'`,
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
