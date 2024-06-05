const rp = require("request-promise-native");

const gerarPalavraAleatoria = () => {
  const letrasMinusculas = "abcdefghijklmnopqrstuvwxyz";
  const letrasMaiusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";

  // Função para pegar um caractere aleatório de uma string
  function pegarCaractereAleatorio(str) {
    const indiceAleatorio = Math.floor(Math.random() * str.length);
    return str[indiceAleatorio];
  }

  // Garantir que temos pelo menos uma letra maiúscula, um número e letras minúsculas
  let palavra = pegarCaractereAleatorio(letrasMaiusculas);
  palavra += pegarCaractereAleatorio(numeros);
  for (let i = 0; i < 6; i++) {
    palavra += pegarCaractereAleatorio(letrasMinusculas);
  }

  // Embaralhar os caracteres para distribuir aleatoriamente
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
  async sendMail(desc, name, email, subject) {
    try {
      var record = {};
      record.new_description = desc;
      record.new_name = name;
      record.new_code = gerarPalavraAleatoria();
      record.new_email = email;
      record.new_subject = subject;

      var options = {
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
        url: `https://newproject.crm.dynamics.com/api/data/v9.2/new_emailverifications`,
      };
      const response = await rp(options);
      console.log(response);
      return response;
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Mailler;
