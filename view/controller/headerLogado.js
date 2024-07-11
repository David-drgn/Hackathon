var user;

$(document).ready(function () {
  $("#loader").load("./assets/includes/load.html");
});

function loading(view) {
  if (view) $("#loader").css("display", "flex");
  else $("#loader").css("display", "none");
}

if (localStorage.getItem("token")) {
  loading(true);
  fetch(`${location.origin}/api/verifyToken`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      token: localStorage.getItem("token"),
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      loading(false);
      user = json;
      if (!json) {
        localStorage.removeItem("token");
        location.href = "/";
      }
      document.getElementsByClassName(
        "name_logado"
      )[0].innerHTML = `Olá, <b>${json.name}</b>`;
      chatResponse(
        `Olá, quem é você? e qual o seu objetivo? Me chame de ${json.name}`
      );
    })
    .catch(function (error) {
      loading(false);
      console.log(error.message);
    });
}

function logout() {
  localStorage.removeItem("token");
  location.href = "/";
}

function openDialog(title, message, next = null) {
  $("#dialog").empty();
  $(document).ready(function () {
    $("#dialog").load("./assets/includes/alert.html", function () {
      document.getElementById("title_alert").textContent = title;
      document.getElementById("message_alert").textContent = message;
      setTimeout(() => {
        $("#dialog").empty();
        switch (next) {
          case "login":
            $("#dialog").load("./pages/userLogin.html");
            break;
          case "register":
            $("#dialog").load("./pages/userRegister.html");
            break;
          case !null:
            location.href = `${location.origin}/${next}`;
            break;
        }
      }, 2800);
    });
  });
}
