$(document).ready(function () {
  $("#header").load("/pages/headers/main/header");
  $("#content").load("/pages/hero/hero.html");
});

window.addEventListener("load", () => {
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
        } else {
          openDialog(
            "Que bom te ver!",
            `Um login foi encontrado, bem vindo ${json.name}`,
            "home"
          );
        }
      })
      .catch(function (error) {
        loading(false);
        console.log("Erro: " + error.message);
      });
  }
});

function view(element) {
  if (element.parentElement.children[0].type == "text") {
    element.parentElement.children[0].type = "password";
    element.src = "/assets/icon/eyeOpen.png";
  } else {
    element.parentElement.children[0].type = "text";
    element.src = "/assets/icon/eyeClose.png";
  }
}

function closeRegister() {
  $(document).ready(function () {
    $("#dialog").empty();
  });
}
