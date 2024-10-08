function showMenu(father) {
  let menu = document.getElementById("background_header");
  if (menu.style.display == "" || menu.style.display == "none") {
    menu.style.display = "block";
    setTimeout(() => {
      menu.children[0].style.transform = "translateY(0%)";
    }, 10);
    father.src = "/assets/icon/excluir.png";
    father.classList.add("image_rotate");
  } else {
    menu.children[0].style.transform = "translateY(-105%)";
    setTimeout(() => {
      menu.style.display = "none";
    }, 1000);
    father.src = "/assets/icon/cardapio.png";
    father.classList.remove("image_rotate");
  }
}

function loginOpen() {
  $("#dialog").empty();
  $(document).ready(function () {
    $("#dialog").load("/pages/PopUp/login/login.html", function () {
      const formGroups = document.querySelectorAll(".form__group");

      formGroups.forEach((formGroup) => {
        const inputField = formGroup.querySelector(".form__field");
        const labels = formGroup.querySelectorAll(".form__label, .icon__label");
        labels.forEach((label) => {
          label.addEventListener("click", () => {
            if (!label.classList.contains("eye")) inputField.focus();
          });
        });
      });
    });
  });
}

function registerEnterpriseOpen() {
  $("#dialog").empty();
  $(document).ready(function () {
    $("#dialog").load("/pages/PopUp/registerEnterprise/register.html", function () {
      $("[title]").tooltip({
        show: {
          effect: "slideDown",
          delay: 100,
        },
        hide: {
          effect: "slideUp",
        },
      });

      $("#senha_register").tooltip({
        show: {
          effect: "slideDown",
          delay: 100,
        },
        hide: {
          effect: "slideUp",
        },
        content: `
          <b>A senha deve ter:</b>
          <ul>
            <li>Caracteres especiais</li>
            <li>Mínimo de 8 caracteres</li>
            <li>Caracteres maiúsculos</li>
            <li>Caracteres minúsculos</li>
          </ul>
        `,
      });
    });
  });
}

function registerOpen() {
  $("#dialog").empty();
  $(document).ready(function () {
    $("#dialog").load("/pages/PopUp/register/register.html", function () {
      $("[title]").tooltip({
        show: {
          effect: "slideDown",
          delay: 100,
        },
        hide: {
          effect: "slideUp",
        },
      });

      $("#senha_register").tooltip({
        show: {
          effect: "slideDown",
          delay: 100,
        },
        hide: {
          effect: "slideUp",
        },
        content: `
          <b>A senha deve ter:</b>
          <ul>
            <li>Caracteres especiais</li>
            <li>Mínimo de 8 caracteres</li>
            <li>Caracteres maiúsculos</li>
            <li>Caracteres minúsculos</li>
          </ul>
        `,
      });
    });
  });
}

function forgetOpen() {
  $("#dialog").empty();
  $(document).ready(function () {
    $("#dialog").load("/pages/PopUp/forget/forget.html");
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
    $("#dialog").load("/pages/PopUp/dialog/alert.html", function () {
      document.getElementById("title_alert").textContent = title;
      document.getElementById("message_alert").textContent = message;
      setTimeout(() => {
        if (next != null) {
          switch (next) {
            case "login":
              $("#dialog").load("/pages/PopUp/login/login.html");
              break;
            case "register":
              $("#dialog").load("/pages/PopUp/register/register.html");
              break;
            default:
              console.log(next);
              debugger;
              location.href = `${location.origin}/${next}`;
              break;
          }
        }
      }, 2800);
    });
  });
}

$(document).ready(function () {
  $("#loader").load("/pages/load/load.html");
});

function loading(view) {
  if (view) $("#loader").css("display", "flex");
  else $("#loader").css("display", "none");
}
