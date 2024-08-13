async function login() {
  const email = document.getElementById("email_login").value;
  const password = document.getElementById("password_login").value;

  if (email == "" || password == "") {
    if (email == "")
      document.getElementsByClassName("erro_login")[0].style.display = "block";
    else
      document.getElementsByClassName("erro_login")[0].style.display = "none";
    if (password == "")
      document.getElementsByClassName("erro_login")[1].style.display = "block";
    else
      document.getElementsByClassName("erro_login")[1].style.display = "none";

    return;
  }
  loading(true);

  document.getElementsByClassName("erro_login")[0].style.display = "none";
  document.getElementsByClassName("erro_login")[1].style.display = "none";

  const request = await fetch(`${location.origin}/api/login`, {
    method: "POST",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify({
      email,
      password,
      check: document.getElementById("safe").checked,
    }),
  });

  loading(false);
  if (request.ok) {
    let response = await request.json();
    localStorage.setItem("token", response.token);
    openDialog(
      "Bem vindo ao nosso sistema",
      "Login realizado com exito, é muito bom ter você por aqui",
      "home"
    );
  } else {
    openDialog(
      "Erro no login",
      "Ocorreu um erro ao realizar o login, tente novamente mais tarde"
    );
  }
}