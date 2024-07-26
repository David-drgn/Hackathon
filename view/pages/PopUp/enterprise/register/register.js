if (!inputs_register && !span_register) {
  var inputs_register = {};
  var span_register = {};
}

function loadRegister() {
  inputs_register = {
    nome: document.getElementById("nome_register"),
    cpf: document.getElementById("cpf_register"),
    email: document.getElementById("email_register"),
    tel: document.getElementById("tel_register"),
    senha: document.getElementById("senha_register"),
    confirm: document.getElementById("senhaConfirm_register"),
  };

  span_register = {
    nome: document.getElementById("span_nome"),
    cpf: document.getElementById("span_cpf"),
    email: document.getElementById("span_email"),
    tel: document.getElementById("span_tel"),
    senha: document.getElementById("span_senha"),
    confirm: document.getElementById("span_senhaConfirm"),
  };
}

function validarSenha(senha) {
  const minLength = senha.length >= 8;
  const temCaracteresEspeciais = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
  const temMaiusculos = /[A-Z]/.test(senha);
  const temMinusculos = /[a-z]/.test(senha);

  return minLength && temCaracteresEspeciais && temMaiusculos && temMinusculos;
}

async function register() {
  let complete = true;
  for (let key in inputs_register) {
    if (inputs_register.hasOwnProperty(key)) {
      if (inputs_register[key].value == "") {
        span_register[key].style.display = "block";
        complete = false;
      } else {
        span_register[key].style.display = "none";
      }
    }
  }

  let senhaValida = validarSenha(inputs_register["senha"].value);

  if (!senhaValida) {
    span_register["senha"].style.display = "block";
    complete = false;
  } else span_register["senha"].style.display = "none";

  if (inputs_register["senha"].value != inputs_register["confirm"].value) {
    span_register["confirm"].style.display = "block";
    complete = false;
  } else span_register["confirm"].style.display = "none";

  if (!(await cpf(inputs_register["cpf"].value))) {
    span_register["cpf"].style.display = "block";
    complete = false;
  } else span_register["cpf"].style.display = "none";

  if (!complete) return;
  else {
    fetch(`${location.origin}/api/sendMail`, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        email: inputs_register["email"].value,
        name: inputs_register["nome"].value,
        dataUser: {
          name: inputs_register["nome"].value,
          email: inputs_register["email"].value,
          password: inputs_register["senha"].value,
          telephone: inputs_register["tel"].value,
          document: inputs_register["cpf"].value,
        },
        type: 0,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        if (json.erro) {
          openDialog(
            "Erro",
            "Algo deu errado, por favor, tente novamente mais tarde"
          );
        } else {
          openDialog(
            "Email enviado!!",
            "Para realizar o login, por favor, entre no link enviado ao seu email"
          );
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  }
}

// async function bot(quest) {
//   return new Promise(async (resolve, reject) => {
//     fetch(`${location.origin}/api/requestChat`, {
//       method: "POST",
//       headers: {
//         "Content-type": "application/json; charset=UTF-8",
//       },
//       body: JSON.stringify({ question: quest }),
//     })
//       .then((response) => response.json())
//       .then((json) => {
//         console.log(json);
//       })
//       .catch(function (error) {
//         console.log(error.message);
//       });
//   });
// }

async function cpf(cpf) {
  return new Promise(async (resolve, reject) => {
    fetch(`${location.origin}/api/validaCPF`, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ cpf }),
    })
      .then((response) => response.json())
      .then((json) => {
        resolve(json);
      })
      .catch(function (error) {
        console.log(error.message);
        resolve(false);
      });
  });
}
