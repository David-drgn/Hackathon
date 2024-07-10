if (localStorage.getItem("token")) {
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
      console.log(json);
      if (!json) {
        localStorage.removeItem("token");
        location.href = "/";
      }
      document.getElementsByClassName(
        "name_logado"
      )[0].innerHTML = `Olá, <b>${json.name}</b>`;
    })
    .catch(function (error) {
      console.log(error.message);
    });
}
