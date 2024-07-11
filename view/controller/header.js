function showMenu(father) {
  let menu = document.getElementById("background_header");
  if (menu.style.display == "" || menu.style.display == "none") {
    menu.style.display = "block";
    setTimeout(() => {
      menu.children[0].style.transform = "translateY(0%)";
    }, 10);
    father.src = "../assets/icon/excluir.png";
    father.classList.add("image_rotate");
  } else {
    menu.children[0].style.transform = "translateY(-105%)";
    setTimeout(() => {
      menu.style.display = "none";
    }, 1000);
    father.src = "../assets/icon/cardapio.png";
    father.classList.remove("image_rotate");
  }
}

function loginOpen() {
  $("#dialog").empty();
  $(document).ready(function () {
    $("#dialog").load("./pages/userLogin.html");
  });
}

function registerOpen() {
  $("#dialog").empty();
  $(document).ready(function () {
    $("#dialog").load("./pages/userRegister.html");
  });
}

function forgetOpen() {
  $("#dialog").empty();
  $(document).ready(function () {
    $("#dialog").load("./pages/userForget.html");
  });
}

function sobreNos() {
  document.getElementsByClassName("sobre_main")[0].style.display = "flex";
  document.getElementsByClassName("text_main")[0].style.display = "none";
  document.getElementsByClassName("button_header")[2].style.display = "unset";
  document.getElementsByClassName("button_header")[1].style.display = "none";

  document.getElementsByClassName("button_header")[7].style.display = "unset";
  document.getElementsByClassName("button_header")[6].style.display = "none";
}

function paginaInicial() {
  document.getElementsByClassName("sobre_main")[0].style.display = "none";
  document.getElementsByClassName("text_main")[0].style.display = "flex";
  document.getElementsByClassName("button_header")[2].style.display = "none";
  document.getElementsByClassName("button_header")[1].style.display = "unset";

  document.getElementsByClassName("button_header")[7].style.display = "none";
  document.getElementsByClassName("button_header")[6].style.display = "unset";
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

$(document).ready(function () {
  $("#loader").load("./assets/includes/load.html");
});

function loading(view) {
  if (view) $("#loader").css("display", "flex");
  else $("#loader").css("display", "none");
}
