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

  async update(record, userId) {
    return new Promise((resolve, reject) => {
      try {
        fetch(
          `${process.env.BASE_REQUEST_URL}/api/data/v9.2/accounts(${userId})`,
          {
            method: "PATCH",
            headers: {
              "OData-MaxVersion": "4.0",
              "OData-Version": "4.0",
              "Content-Type": "application/json; charset=utf-8",
              Accept: "application/json",
              Prefer: "odata.include-annotations=*",
              Authorization: "Bearer " + this.token,
            },
            body: JSON.stringify(record),
          }
        )
          .then(function success(response) {
            if (response.ok) {
              console.log("Record updated");
              resolve({ erro: false });
            } else {
              resolve({ erro: true });
            }
          })
          .catch(function (error) {
            resolve({ erro: true });
          });
      } catch {
        resolve({ erro: true });
      }
    });
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
        url: `${process.env.BASE_REQUEST_URL}/api/data/v9.2/accounts?$select=emailaddress1,name,new_password,_new_plano_value,telephone1,new_document,new_salt,new_tipodaconta,new_perfil&$filter=emailaddress1 eq '${email}'`,
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
          `${process.env.BASE_REQUEST_URL}/api/data/v9.2/accounts?$select=accountid,name,new_atendeemdomicilio,new_perfil,description,new_document,address1_name&$expand=Account_Annotation($select=notetext,documentbody,filename,mimetype,objecttypecode),new_agendamento_Prestador_account($select=new_data_agendada,new_dataterminoagenda,new_tipohorario),new_Account_new_Servico_new_Servico($select=new_servicoid)&$filter=new_tipodaconta eq 1`,
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
            for (let i = 0; i < results.value.length; i++) {
              let prestador = {};
              let result = results.value[i];
              // Columns

              prestador.id = result["accountid"];
              prestador.name = result["name"];

              prestador.domicilio = result["new_atendeemdomicilio"];
              prestador.description = result["description"];
              prestador.documento = result["new_document"];
              prestador.endereco = result["address1_name"];
              prestador.image = result["new_perfil"];

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
                prestador.agenda.push({
                  livre:
                    result.new_agendamento_Prestador_account[j][
                      "new_data_agendada"
                    ],
                  termino:
                    result.new_agendamento_Prestador_account[j][
                      "new_dataterminoagenda"
                    ], // Date Time
                  tipo: result.new_agendamento_Prestador_account[j][
                    "new_tipohorario"
                  ],
                });
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

  async getEventsByUserId(userId) {
    try {
      return new Promise((resolve, reject) => {
        fetch(
          `${process.env.BASE_REQUEST_URL}/api/data/v9.2/new_agendamentos?$select=new_local,_new_cliente_value,new_data_agendada,new_dataterminoagenda,new_local,_new_prestador_value,new_tipohorario,_new_servico_value&$filter=(_new_cliente_value eq ${userId} or _new_prestador_value eq ${userId})`,
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
            for (let i = 0; i < results.value.length; i++) {
              let result = results.value[i];
              // Columns

              let event = {
                id: result["new_agendamentoid"],
                title:
                  result["_new_cliente_value"] == userId
                    ? `Consulta com ${result["_new_prestador_value@OData.Community.Display.V1.FormattedValue"]}`
                    : result[
                        "_new_cliente_value@OData.Community.Display.V1.FormattedValue"
                      ] != undefined
                    ? `Consulta com ${result["_new_cliente_value@OData.Community.Display.V1.FormattedValue"]}`
                    : `Agenda livre`,
                start: result["new_data_agendada"],
                end: result["new_dataterminoagenda"],
                allDay: false,
                type: result[
                  "new_tipohorario@OData.Community.Display.V1.FormattedValue"
                ],
                service:
                  result[
                    "_new_servico_value@OData.Community.Display.V1.FormattedValue"
                  ],
                local: result["new_local"],
              };

              data.push(event);
              // var new_servico = result["_new_servico_value"]; // Lookup
              // var new_servico_formatted =
              //   result[
              //     "_new_servico_value@OData.Community.Display.V1.FormattedValue"
              //   ];
              // var new_servico_lookuplogicalname =
              //   result[
              //     "_new_servico_value@Microsoft.Dynamics.CRM.lookuplogicalname"
              //   ];
              // var new_agendamentoid = result["new_agendamentoid"]; // Guid
              // var new_cliente = result["_new_cliente_value"]; // Lookup
              // var new_cliente_formatted =
              //   result[
              //     "_new_cliente_value@OData.Community.Display.V1.FormattedValue"
              //   ];
              // var new_cliente_lookuplogicalname =
              //   result[
              //     "_new_cliente_value@Microsoft.Dynamics.CRM.lookuplogicalname"
              //   ];
              // var new_data_agendada = result["new_data_agendada"]; // Date Time
              // var new_data_agendada_formatted =
              //   result[
              //     "new_data_agendada@OData.Community.Display.V1.FormattedValue"
              //   ];
              // var new_dataterminoagenda = result["new_dataterminoagenda"]; // Date Time
              // var new_dataterminoagenda_formatted =
              //   result[
              //     "new_dataterminoagenda@OData.Community.Display.V1.FormattedValue"
              //   ];
              // var new_local = result["new_local"]; // Text
              // var new_tipohorario = result["new_tipohorario"]; // Choice
              // var new_tipohorario_formatted =
              //   result[
              //     "new_tipohorario@OData.Community.Display.V1.FormattedValue"
              //   ];
              // var new_prestador = result["_new_prestador_value"]; // Lookup
              // var new_prestador_formatted =
              //   result[
              //     "_new_prestador_value@OData.Community.Display.V1.FormattedValue"
              //   ];
              // var new_prestador_lookuplogicalname =
              //   result[
              //     "_new_prestador_value@Microsoft.Dynamics.CRM.lookuplogicalname"
              //   ];
            }

            resolve(data);
          })
          .catch(function (error) {
            resolve(null);
          });
      });
    } catch (error) {}
  }
  async getEventsById(eventId) {
    return new Promise((resolve, reject) => {
      fetch(
        `${process.env.BASE_REQUEST_URL}/api/data/v9.2/new_agendamentos?$select=_new_cliente_value,new_data_agendada,new_dataterminoagenda,new_local,_new_prestador_value,new_tipohorario&$expand=new_Cliente($select=description,new_redessociais,new_document,emailaddress1,name,telephone1),new_Prestador($select=description,new_redessociais,new_document,emailaddress1,name,telephone1)&$filter=new_agendamentoid eq ${eventId}`,
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
          var response = responseObjects[0];
          var responseBody = responseObjects[1];
          var results = responseBody;
          let data = [];
          for (var i = 0; i < results.value.length; i++) {
            var result = results.value[i];
            // Columns

            let agendamento = {
              id: result["new_agendamentoid"],
              dataAgendada: result["new_data_agendada"],
              dataTermino: result["new_dataterminoagenda"],
              local: result["new_local"],
              prestador:
                result[
                  "_new_prestador_value@OData.Community.Display.V1.FormattedValue"
                ],
              tipoHorario:
                result[
                  "new_tipohorario@OData.Community.Display.V1.FormattedValue"
                ],
            };

            // var new_agendamentoid = result["new_agendamentoid"]; // Guid
            // var new_cliente = result["_new_cliente_value"]; // Lookup
            // var new_cliente_formatted = result["_new_cliente_value@OData.Community.Display.V1.FormattedValue"];
            // var new_cliente_lookuplogicalname = result["_new_cliente_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
            // var new_data_agendada = result["new_data_agendada"]; // Date Time
            // var new_data_agendada_formatted = result["new_data_agendada@OData.Community.Display.V1.FormattedValue"];
            // var new_dataterminoagenda = result["new_dataterminoagenda"]; // Date Time
            // var new_dataterminoagenda_formatted = result["new_dataterminoagenda@OData.Community.Display.V1.FormattedValue"];
            // var new_local = result["new_local"]; // Text
            // var new_prestador = result["_new_prestador_value"]; // Lookup
            // var new_prestador_formatted = result["_new_prestador_value@OData.Community.Display.V1.FormattedValue"];
            // var new_prestador_lookuplogicalname = result["_new_prestador_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
            // var new_tipohorario = result["new_tipohorario"]; // Choice
            // var new_tipohorario_formatted = result["new_tipohorario@OData.Community.Display.V1.FormattedValue"];

            // Many To One Relationships
            if (
              result.hasOwnProperty("new_Cliente") &&
              result["new_Cliente"] !== null
            ) {
              agendamento.cliente = {
                descricao: result["new_Cliente"]["description"],
                documento: result["new_Cliente"]["new_document"],
                email: result["new_Cliente"]["emailaddress1"],
                redes: result["new_Cliente"]["new_redessociais"],
                nome: result["new_Cliente"]["name"],
                telefone: result["new_Cliente"]["telephone1"],
              };
              // var new_Cliente_description =
              //   result["new_Cliente"]["description"]; // Multiline Text
              // var new_Cliente_new_document =
              //   result["new_Cliente"]["new_document"]; // Text
              // var new_Cliente_emailaddress1 =
              //   result["new_Cliente"]["emailaddress1"]; // Text
              // var new_Cliente_name = result["new_Cliente"]["name"]; // Text
              // var new_Cliente_telephone1 = result["new_Cliente"]["telephone1"]; // Text
            } else agendamento.cliente = null;

            if (
              result.hasOwnProperty("new_Prestador") &&
              result["new_Prestador"] !== null
            ) {
              agendamento.prestador = {
                descricao: result["new_Prestador"]["description"],
                documento: result["new_Prestador"]["new_document"],
                email: result["new_Prestador"]["emailaddress1"],
                redes: result["new_Prestador"]["new_redessociais"],
                nome: result["new_Prestador"]["name"],
                telefone: result["new_Prestador"]["telephone1"],
              };
              // var new_Prestador_description =
              //   result["new_Prestador"]["description"]; // Multiline Text
              // var new_Prestador_new_document =
              //   result["new_Prestador"]["new_document"]; // Text
              // var new_Prestador_emailaddress1 =
              //   result["new_Prestador"]["emailaddress1"]; // Text
              // var new_Prestador_name = result["new_Prestador"]["name"]; // Text
              // var new_Prestador_telephone1 = result["new_Prestador"]["telephone1"]; // Text
            } else agendamento.prestador = null;

            data.push(agendamento);
          }
          resolve(data);
        })
        .catch(function (error) {
          console.log(error.message);
          resolve(null);
        });
    });
  }

  async registerAgendaLivre(record) {
    return new Promise((resolve, reject) => {
      try {
        fetch(
          `${process.env.BASE_REQUEST_URL}/api/data/v9.2/new_agendamentos`,
          {
            method: "POST",
            headers: {
              "OData-MaxVersion": "4.0",
              "OData-Version": "4.0",
              "Content-Type": "application/json; charset=utf-8",
              Accept: "application/json",
              Prefer: "odata.include-annotations=*",
              Authorization: "Bearer " + this.token,
            },
            body: JSON.stringify(record),
          }
        )
          .then(function success(response) {
            if (response.ok) {
              var uri = response.headers.get("OData-EntityId");
              var regExp = /\(([^)]+)\)/;
              var matches = regExp.exec(uri);
              var newId = matches[1];
              console.log(newId);
              resolve({
                erro: false,
              });
            } else {
              resolve({ erro: true });
            }
          })
          .catch(function (error) {
            resolve({ erro: true });
            console.log(error.message);
          });
      } catch {
        resolve({ erro: true });
      }
    });
  }

  async registerAgenda(record) {
    return new Promise((resolve, reject) => {
      try {
        fetch(
          `${process.env.BASE_REQUEST_URL}/api/data/v9.2/new_agendamentos`,
          {
            method: "POST",
            headers: {
              "OData-MaxVersion": "4.0",
              "OData-Version": "4.0",
              "Content-Type": "application/json; charset=utf-8",
              Accept: "application/json",
              Prefer: "odata.include-annotations=*",
              Authorization: "Bearer " + this.token,
            },
            body: JSON.stringify(record),
          }
        )
          .then(function success(response) {
            if (response.ok) {
              var uri = response.headers.get("OData-EntityId");
              var regExp = /\(([^)]+)\)/;
              var matches = regExp.exec(uri);
              var newId = matches[1];
              console.log(newId);
              resolve({
                erro: false,
              });
            } else {
              resolve({ erro: true });
            }
          })
          .catch(function (error) {
            resolve({ erro: true });
            console.log(error.message);
          });
      } catch {
        resolve({ erro: true });
      }
    });
  }

  // async add30minAgenda(id, dataAgendada, dataFinal) {
  //   return new Promise((resolve, reject) => {
  //     let dataAgendadaDate = new Date(dataAgendada);
  //     let dataFinalDate = new Date(dataFinal);

  //     dataAgendadaDate.setMinutes(dataAgendadaDate.getMinutes() + 30);

  //     if (dataAgendada.getTime() === dataFinalDate.getTime()) {
  //       console.log("dataAgendada agora é igual a dataFinal.");
  //       fetch(
  //         `${process.env.BASE_REQUEST_URL}/api/data/v9.2/new_agendamentos(${id})`,
  //         {
  //           method: "DELETE",
  //           headers: {
  //             "OData-MaxVersion": "4.0",
  //             "OData-Version": "4.0",
  //             "Content-Type": "application/json; charset=utf-8",
  //             Accept: "application/json",
  //           },
  //         }
  //       )
  //         .then(function success(response) {
  //           if (response.ok) {
  //             resolve({ erro: false });
  //           } else {
  //             resolve({ erro: true });
  //           }
  //         })
  //         .catch(function (error) {
  //           resolve({ erro: true });
  //         });
  //     } else {
  //       console.log("dataAgendada não é igual a dataFinal.");
  //       record = {};
  //       record.new_data_agendada = dataAgendadaDate.toISOString();
  //       try {
  //         fetch(
  //           `${process.env.BASE_REQUEST_URL}/api/data/v9.2/new_agendamentos(${id})`,
  //           {
  //             method: "PATCH",
  //             headers: {
  //               "OData-MaxVersion": "4.0",
  //               "OData-Version": "4.0",
  //               "Content-Type": "application/json; charset=utf-8",
  //               Accept: "application/json",
  //               Prefer: "odata.include-annotations=*",
  //             },
  //             body: JSON.stringify(record),
  //           }
  //         )
  //           .then(function success(response) {
  //             if (response.ok) {
  //               resolve({ erro: false });
  //             } else {
  //               resolve({ erro: true });
  //             }
  //           })
  //           .catch(function (error) {
  //             resolve({ erro: true });
  //           });
  //       } catch {
  //         resolve({ erro: true });
  //       }
  //     }
  //   });
  // }
}

module.exports = User;
