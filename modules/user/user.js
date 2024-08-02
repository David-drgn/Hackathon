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
            let response = responseObjects[0];
            let responseBody = responseObjects[1];
            let result = responseBody;
            console.log(result);
            // Columns
            let accountid = result["accountid"]; // Guid
            let emailaddress1 = result["emailaddress1"]; // Text
            let name = result["name"]; // Text
            let new_tipodaconta = result["new_tipodaconta"]; // Choice
            let new_tipodaconta_formatted =
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

  async getPrestadorByService(serviceId) {
    try {
      return new Promise((resolve, reject) => {
        fetch(
          `${process.env.BASE_REQUEST_URL}/api/data/v9.2/accounts?$select=accountid,name&$expand=Account_Annotation($select=notetext,documentbody,filename,mimetype,objecttypecode),new_agendamento_Prestador_account($select=new_data_agendada,new_dataterminoagenda,new_tipohorario),new_Account_new_Servico_new_Servico($select=new_servicoid)&$filter=new_tipodaconta eq 1`,
          {
            method: "GET",
            headers: {
              "OData-MaxVersion": "4.0",
              "OData-Version": "4.0",
              "Content-Type": "application/json; charset=utf-8",
              Accept: "application/json",
              Prefer: "odata.include-annotations=*",
              Authorization: "Bearer " + this.token,
            },
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
          .then(function (responseObjects) {
            let response = responseObjects[0];
            let responseBody = responseObjects[1];
            let results = responseBody;
            let data = [];
            console.log(results);
            for (let i = 0; i < results.value.length; i++) {
              let prestador = {};
              let result = results.value[i];
              // Columns

              prestador.id = result["accountid"];
              prestador.name = result["name"];

              prestador.docs = [];
              // One To Many Relationships
              for (let j = 0; j < result.Account_Annotation.length; j++) {
                prestador.docs.push({
                  body: result.Account_Annotation[j]["documentbody"], // Text
                  fileName: result.Account_Annotation[j]["filename"], // Text
                  mimetype: result.Account_Annotation[j]["mimetype"], // Text
                });
                //  result.Account_Annotation[j]["notetext"]; // Multiline Text
                // result.Account_Annotation[j]["objecttypecode"]; // EntityName
                // result.Account_Annotation[j][
                //     "objecttypecode@OData.Community.Display.V1.FormattedValue"
                //   ];
              }

              prestador.agenda = [];
              for (
                var j = 0;
                j < result.new_agendamento_Prestador_account.length;
                j++
              ) {
                if (
                  result.new_agendamento_Prestador_account[j][
                    "new_tipohorario"
                  ] == 1
                ) {
                  prestador.agenda.push({
                    livre:
                      result.new_agendamento_Prestador_account[j][
                        "new_data_agendada"
                      ],
                    termino:
                      result.new_agendamento_Prestador_account[j][
                        "new_dataterminoagenda"
                      ], // Date Time
                  });
                }
              }

              prestador.service = false;
              // Many To Many Relationships
              for (
                let j = 0;
                j < result.new_Account_new_Servico_new_Servico.length;
                j++
              ) {
                if (
                  result.new_Account_new_Servico_new_Servico[j][
                    "new_servicoid"
                  ] == serviceId
                ) {
                  prestador.service = true;
                }
              }

              if (prestador.service) data.push(prestador);
            }

            resolve(data);
          })
          .catch(function (error) {
            resolve(null);
          });
      });
    } catch {}
  }
}

module.exports = User;
