window.addEventListener("load", () => {
  console.log("OII");
  fetch(`${location.origin}/api/verifyToken`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      document.getElementsByClassName(
        "name_logado"
      )[0].innerHTML = `Olá, <b>${json.name}</b>`;
    })
    .catch(function (error) {
      console.log(error.message);
    });
});
