async function forgetSendMail() {
  let valueEmail = document.getElementById("email_forget").value;
  if (!valueEmail) {
    document.getElementsByClassName("erro_forget")[0].style.display = "block";
  } else {
    document.getElementsByClassName("erro_forget")[0].style.display = "none";
  }
  fetch(`${location.origin}/api/sendMail`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      email: valueEmail,
      name: null,
      dataUser: null,
      type: 1,
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
          "Para mudar a sua senha, por favor, entre no link enviado ao seu email, lembrando que o acesso é válido apenas por 5 minutos"
        );
      }
    })
    .catch(function (error) {
      console.log(error.message);
    });
}
