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
        switch (next) {
          case "login":
            $("#dialog").load("./pages/userLogin.html");
            break;
          case "register":
            $("#dialog").load("./pages/userRegister.html");
            break;
          case !null:
            location.href = `/${next}`;
            break;
        }
      }, 2800);
    });
  });
}

function activeSearch() {
  document.getElementById("search_text").classList.add("active");
  document.getElementsByClassName("search_view")[0].style.display = "flex";

  let container = document.getElementsByClassName("container");
  if (
    document.getElementsByClassName("help_doctor")[0].style.display == "block"
  )
    for (let i = 0; i < container.length; i++) {
      container[i].style.width = "calc(90% - 120px)";
    }

  document.getElementsByClassName("help_doctor")[0].style.display = "none";
}

function deactiveSearch() {
  document.getElementById("search_text").classList.remove("active");
  document.getElementsByClassName("search_view")[0].style.display = "none";

  if (document.getElementById("settings").style.display != "flex")
    document.getElementsByClassName("help_doctor")[0].style.display = "block";

  let container = document.getElementsByClassName("container");
  for (let i = 0; i < container.length; i++) {
    container[i].style.width = "";
  }
}

function logout() {
  localStorage.removeItem("token");
  location.href = "/";
}