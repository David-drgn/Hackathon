$(document).ready(function () {
  $("#loader").load("/pages/load/load.html");
});

function loading(view) {
  if (view) $("#loader").css("display", "flex");
  else $("#loader").css("display", "none");
}

function view(element) {
  if (element.parentElement.children[0].type == "text") {
    element.parentElement.children[0].type = "password";
    element.src = "/assets/icon/eyeOpen.png";
  } else {
    element.parentElement.children[0].type = "text";
    element.src = "/assets/icon/eyeClose.png";
  }
}

window.addEventListener("load", () => {
  const id = new URL(window.location.href).searchParams.get("id");

  if(!id) window.location.href = "/systemErro?erro=400"
  console.log(id)

  $("#password").tooltip({
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
