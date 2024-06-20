const rp = require("request-promise-native");
const { v1: uuidv1, v4: uuidv4 } = require("uuid");

const gerarPalavraAleatoria = () => {
  const letrasMinusculas = "abcdefghijklmnopqrstuvwxyz";
  const letrasMaiusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";
  function pegarCaractereAleatorio(str) {
    const indiceAleatorio = Math.floor(Math.random() * str.length);
    return str[indiceAleatorio];
  }

  let palavra = pegarCaractereAleatorio(letrasMaiusculas);
  palavra += pegarCaractereAleatorio(numeros);
  for (let i = 0; i < 6; i++) {
    palavra += pegarCaractereAleatorio(letrasMinusculas);
  }

  palavra = palavra
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
  return palavra;
};

class Mailler {
  token;

  constructor(token) {
    this.token = token;
  }
  async sendMail(desc, name, email, subject, button) {
    try {
      var record = {};
      record.new_description = desc;
      record.new_name = name;
      record.new_code = gerarPalavraAleatoria();
      record.new_email = email;
      record.new_subject = subject;
      record.new_button = button;

      record.new_url = record.new_code;

      return new Promise((resolve, reject) => {
        fetch(
          `https://newproject.crm.dynamics.com/api/data/v9.2/new_emailverifications?$select=new_code,new_email,new_url`,
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
          .then(function (responseObjects) {
            var responseBody = responseObjects[1];
            var result = responseBody;
            resolve(result);
          })
          .catch(function (error) {
            return {
              error: true,
              message: error.message,
            };
          });
      });
    } catch (e) {
      return {
        error: true,
        message: e,
      };
    }
  }
}

module.exports = Mailler;
