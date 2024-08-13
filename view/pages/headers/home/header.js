var user;

function logout() {
  localStorage.removeItem("token");
  location.href = "/";
}

function openDialog(title, message, next = null) {
  $("#dialog").empty();
  $(document).ready(function () {
    $("#dialog").load("/pages/PopUp/dialog/alert.html", function () {
      document.getElementById("title_alert").textContent = title;
      document.getElementById("message_alert").textContent = message;
      setTimeout(async () => {
        switch (next) {
          case "services":
            $("#dialog").empty();
            $("#dialog").load("/pages/PopUp/service/service.html");
            let services = await getAllServices();
            showServicesInDialog(services);
            break;
          case !null:
            location.href = `/${next}`;
            break;
        }
      }, 2800);
    });
  });
}

function openServices() {
  $("#dialog").empty();
  $("#dialog").load("/pages/PopUp/service/service.html", async function () {
    debugger;
    document
      .getElementById("search_text_service")
      .addEventListener("input", debounce(handleInput, 500));
    let services = await getAllServices();
    showServicesInDialog(services);
  });
}

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

async function handleInput() {
  debugger;
  if (this.value != "") {
    let services = await getAllServices();
    services = services.filter((e) =>
      e.new_name.trim().toLowerCase().includes(this.value.trim().toLowerCase())
    );
    showServicesInDialog(services);
  } else {
    let services = await getAllServices();
    showServicesInDialog(services);
  }
}

function showServicesInDialog(services) {
  document.getElementById("all_services").innerHTML = "";
  document.getElementById("yours_services").innerHTML = "";

  const itemService = document.createElement("div");
  itemService.className = "item_service";
  const input = document.createElement("input");
  input.placeholder = "Criar novo serviço";
  const button = document.createElement("button");
  button.className = "service_button";
  button.textContent = "Criar";
  itemService.appendChild(input);
  itemService.appendChild(button);
  document.getElementById("all_services").appendChild(itemService);

  button.addEventListener("click", async () => {
    if (input.value == "") {
      openDialog(
        "Preencha todos os campos",
        "Perdão, mas não é possível criar um serviço sem nome",
        "services"
      );
    } else if (
      services.find(
        (e) =>
          e.new_name.trim().toLowerCase() === input.value.trim().toLowerCase()
      )
    ) {
      openDialog(
        "Serviço existente",
        "Perdão, mas não é possível criar um serviço que já exista",
        "services"
      );
    } else {
      await createService({
        new_name: input.value,
      });
    }
  });

  async function createService(record) {
    loading(true);
    return new Promise((resolve, reject) => {
      fetch(`${location.origin}/api/service/create`, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          record,
          userId: user.accountid,
          token: localStorage.getItem("token"),
        }),
      })
        .then((response) => response.json())
        .then(async (json) => {
          loading(false);
          let services = await getAllServices();
          showServicesInDialog(services);
          resolve(true);
        })
        .catch(async function (error) {
          debugger;
          loading(false);
          let services = await getAllServices();
          showServicesInDialog(services);
          openDialog(
            "Algo deu errado na criação",
            "Algo deu errado na criação o serviço, por favor, tente novamente",
            "services"
          );
          resolve(false);
        });
    });
  }

  async function createServiceRelation(serviceId) {
    loading(true);
    return new Promise((resolve, reject) => {
      fetch(`${location.origin}/api/service/createRelation`, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          accountId: user.accountid,
          serviceId,
        }),
      })
        .then((response) => response.json())
        .then(async (json) => {
          loading(false);
          let services = await getAllServices();
          showServicesInDialog(services);
          resolve(true);
        })
        .catch(async function (error) {
          debugger;
          loading(false);
          let services = await getAllServices();
          showServicesInDialog(services);
          openDialog(
            "Algo deu errado",
            "Algo deu errado no relacionamento do serviço, por favor, tente novamente",
            "services"
          );
          resolve(false);
        });
    });
  }

  async function deleteServiceRelation(serviceId) {
    loading(true);
    return new Promise((resolve, reject) => {
      fetch(`${location.origin}/api/service/deleteRelation`, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          accountId: user.accountid,
          serviceId,
        }),
      })
        .then((response) => response.json())
        .then(async (json) => {
          loading(false);
          let services = await getAllServices();
          showServicesInDialog(services);
          resolve(true);
        })
        .catch(async function (error) {
          debugger;
          loading(false);
          let services = await getAllServices();
          showServicesInDialog(services);
          openDialog(
            "Algo deu errado",
            "Algo deu errado no relacionamento do serviço, por favor, tente novamente",
            "services"
          );
          resolve(false);
        });
    });
  }

  services.forEach((element) => {
    const itemService = document.createElement("div");
    itemService.className = "item_service service";
    const span = document.createElement("span");
    span.textContent = element.new_name;
    const button = document.createElement("button");
    button.className = "service_button";

    if (element.accountsRelated.find((e) => e.accountid === user.accountid)) {
      button.textContent = "Remover serviço";

      button.addEventListener("click", () => {
        deleteServiceRelation(element.new_servicoid);
      });

      itemService.appendChild(span);
      itemService.appendChild(button);

      const container = document.getElementById("yours_services");
      container.appendChild(itemService);
    } else {
      button.textContent = "Adicionar esse serviço";

      button.addEventListener("click", () => {
        createServiceRelation(element.new_servicoid);
      });

      itemService.appendChild(span);
      itemService.appendChild(button);

      const container = document.getElementById("all_services");
      container.appendChild(itemService);
    }
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

  if (
    document.getElementById("settings").style.display != "flex" &&
    document.getElementById("archive").style.display != "flex" &&
    document.getElementById("planView").style.display != "flex"
  )
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
