$(document).ready(function () {
  $("#loader").load("/pages/load/load.html");
});

function loading(view) {
  if (view) $("#loader").css("display", "flex");
  else $("#loader").css("display", "none");
}

$(document).ready(function () {
  $("#header").load("/pages/headers/home/header.html", function () {
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
          user = json;
          console.log(json);
          if (!json) {
            localStorage.removeItem("token");
            location.href = "/";
          }
          document.getElementsByClassName(
            "name_logado"
          )[0].innerHTML = `Olá, <b>${json.name}</b>`;

          document.getElementById("username").textContent = json.name;

          document.getElementById("usertype").textContent =
            json.new_tipodaconta == 0 ? "Cliente" : "Prestador";

          document.getElementById("usermail").textContent = json.emailaddress1;
          document.getElementById("userphone").textContent = json.telephone1;
          document.getElementById("userdocument").textContent =
            json.new_document;
          document.getElementById("userplan").textContent =
            json["_new_plano_value@OData.Community.Display.V1.FormattedValue"];

          if (json.new_perfil != undefined) {
            document.getElementById(
              "image_perfil"
            ).src = `data:image/png;base64,${json.new_perfil}`;
            document.getElementById(
              "userImage"
            ).src = `data:image/png;base64,${json.new_perfil}`;
          }
          chatResponse(
            `Olá, quem é você? e qual o seu objetivo? Me chame de ${json.name}`
          );
          if (user.new_tipodaconta == 0) {
            document.getElementById("plan").style.display = "none";
            document.getElementById("userplan").style.display = "none";
          } else {
            document.getElementById("plan").style.display = "flex";
            document.getElementById("userplan").style.display = "block";
          }
        })
        .catch(function (error) {
          loading(false);
          console.log("Erro: " + error.message);
        });
    } else {
      location.href = "/";
    }
  });

  let container = $("#chatConversation");

  function scrollToBottom() {
    container.scrollTop(container[0].scrollHeight);
  }

  const observer = new MutationObserver(scrollToBottom);
  observer.observe(container[0], { childList: true, subtree: true });
});

function formatarData(data) {
  const partes = data.split("-");
  const ano = partes[0];
  const mes = partes[1];
  const dia = partes[2];
  return `${dia}/${mes}/${ano}`;
}

function formatDate(isoString) {
  const date = new Date(isoString);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

let viewCalendar = 1;
window.addEventListener("load", async () => {
  loading(true);
  setTimeout(() => {
    let calendarEl = document.getElementById("calendar");
    var calendar = new FullCalendar.Calendar(calendarEl, {
      timeZone: "UTC",
      initialView: "dayGridMonth",
      titleFormat: { year: "numeric", month: "long" },
      customButtons: {
        view: {
          text: "Trocar visualização",
          click: function () {
            switch (viewCalendar) {
              case 0:
                calendar.changeView("dayGridMonth");
                viewCalendar++;
                break;
              case 1:
                calendar.changeView("timeGridWeek");
                viewCalendar++;
                break;
              case 2:
                calendar.changeView("listWeek");
                viewCalendar++;
                break;
              case 3:
                calendar.changeView("dayGridWeek");
                viewCalendar++;
                break;
              case 4:
                calendar.changeView("multiMonthYear");
                viewCalendar++;
                break;
              case 5:
                calendar.changeView("timeGridDay");
                viewCalendar = 0;
                break;
            }
          },
        },
        today: {
          text: "Hoje",
          click: function () {
            calendar.today();
          },
        },
        prox: {
          text: "Próximo",
          icon: "chevron-right",
          click: function () {
            calendar.next();
          },
        },
        ant: {
          text: "Anterior",
          icon: "chevron-left",
          click: function () {
            calendar.prev();
          },
        },
      },
      locale: "pt-br",
      selectable: true,
      headerToolbar: {
        left: "ant today prox",
        center: "title",
        right: "view",
      },
      dateClick: function (info) {
        if (info.date.getTime() > new Date().getTime()) {
          // alert("selected " + info.startStr + " to " + info.endStr)
          $("#event").empty();
          $(document).ready(function () {
            debugger;
            $("#event").load(
              "/pages/PopUp/event/event.html",
              async function () {
                document.getElementById("user").style.display = "none";
                document.getElementById("enterprise").style.display = "none";
                if (user.new_tipodaconta == 0) {
                  document.getElementById("user").style.display = "flex";
                } else {
                  document.getElementById("enterprise").style.display = "flex";
                }

                if (info.dateStr.includes("T")) {
                  document.getElementById(
                    "dateSelect"
                  ).textContent = `${formatarData(info.dateStr.split("T")[0])}`;
                  document.getElementById("timePrestador").value = `${
                    info.dateStr.split("T")[1].split(":")[0]
                  }:${info.dateStr.split("T")[1].split(":")[1]}`;

                  document.getElementById(
                    "dateSelectMedico"
                  ).textContent = `${formatarData(info.dateStr.split("T")[0])}`;
                  document.getElementById("timePrestadorFinal").value = `${
                    info.dateStr.split("T")[1].split(":")[0]
                  }:30`;

                  next();
                } else {
                  document.getElementById(
                    "dateSelect"
                  ).textContent = `${formatarData(info.dateStr)}`;

                  document.getElementById(
                    "dateSelectMedico"
                  ).textContent = `${formatarData(info.dateStr)}`;
                }

                let services = await getAllServices();

                let selectElement = document.getElementById("selectOptions");

                services.forEach((element) => {
                  let option = document.createElement("option");

                  option.value = element.new_servicoid;
                  option.title = element.new_descricao;
                  option.text = element.new_name;

                  selectElement.add(option);
                });
              }
            );
          });
        }
      },
      select: function (info) {
        if (info.start.getTime() > new Date().getTime()) {
          if (
            (info.end.getTime() - info.start.getTime()) / (1000 * 3600 * 24) >=
            2
          ) {
            $("#event").empty();
            $(document).ready(function () {
              $("#event").load("/pages/PopUp/event/event.html", function () {
                function ajustarDiaParaUm(dataStr) {
                  const data = new Date(dataStr);
                  data.setUTCDate(data.getUTCDate() - 1);
                  return data.toISOString().slice(0, 10);
                }
                if (info.startStr == info.endStr) {
                  document.getElementById("dateSelect").textContent =
                    info.startStr;
                  document.getElementById(
                    "dateSelectMedico"
                  ).textContent = `${formatarData(info.dateStr)}`;
                } else {
                  document.getElementById(
                    "dateSelect"
                  ).textContent = `${formatarData(
                    info.startStr
                  )} à ${formatarData(ajustarDiaParaUm(info.endStr))}`;
                  document.getElementById(
                    "dateSelectMedico"
                  ).textContent = `${formatarData(
                    info.startStr
                  )} à ${formatarData(ajustarDiaParaUm(info.endStr))}`;
                }
              });
            });
          }
        }
      },
      eventClick: function (info) {
        console.log(info.event);
        viewEvent(info.event.id);
      },
    });
    calendar.render();
    setInterval(() => {
      fetch(`${location.origin}/api/events/getByUser`, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          id: user.accountid,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (json.erro) {
            loading(false);
            if (json.message == "token expires") {
              openDialog(
                "Login",
                "Seu login expirou, por favor, faça o login novamente"
              );
              location.href = "/";
            } else {
              openDialog(
                "Algo deu errado",
                "Por favor, tente realizar o agendamente novamente, mais tarde"
              );
              $("#event").empty();
            }
          } else {
            if (
              (calendar.getEvents().length == 0 && json.response.length == 0) ||
              (calendar.getEvents().length == 0 && json.response.length > 0)
            ) {
              loading(false);
            }
            calendar.getEvents().forEach((element) => {
              element.remove();
            });
            // debugger;
            let container = document.getElementById("appointments_active");
            container.innerHTML = "";

            let containerDeactive = document.getElementById(
              "appointments_deactive"
            );
            containerDeactive.innerHTML = "";

            json.response.forEach((element) => {
              // allDay: false;
              // end: "2024-08-16T08:30:00Z";
              // id: "438cdd4a-fe54-ef11-bfe2-6045bd0822f1";
              // start: "2024-08-16T08:00:00Z";
              // title: "Consulta com David Raphael";
              // type: "Agendamento";
              calendar.addEvent(element);

              const consultasFind = document.createElement("div");
              consultasFind.className = "consultas_find";

              const titleSpan = document.createElement("span");
              titleSpan.className = "subtitle_events";
              titleSpan.textContent = element.title;

              const dateSpanStart = document.createElement("span");
              dateSpanStart.textContent = `Início: ${formatDate(
                element.start
              )}`;

              const dateSpanEnds = document.createElement("span");
              dateSpanEnds.textContent = `Fim: ${formatDate(element.end)}`;

              const consultasWrapper = document.createElement("div");
              consultasWrapper.className = "consultas_wrapper";

              const clienteSpan = document.createElement("span");
              clienteSpan.textContent = element.service;

              const localSpan = document.createElement("span");
              localSpan.textContent = element.local;

              if (
                element.type != "Agendamento Realizado" &&
                element.type != "Agendamento Cancelado"
              ) {
                consultasFind.appendChild(titleSpan);
                consultasWrapper.appendChild(clienteSpan);
                consultasWrapper.appendChild(localSpan);

                consultasFind.appendChild(dateSpanStart);
                consultasFind.appendChild(dateSpanEnds);
                consultasFind.appendChild(consultasWrapper);
                container.appendChild(consultasFind);
              } else {
                titleSpan.textContent = `${element.title.replace(
                  "Consulta",
                  `Consulta ${element.type.replace("Agendamento ", "")}`
                )}`;
                consultasFind.appendChild(titleSpan);
                consultasWrapper.appendChild(clienteSpan);
                consultasWrapper.appendChild(localSpan);

                consultasFind.appendChild(dateSpanStart);
                consultasFind.appendChild(dateSpanEnds);
                consultasFind.appendChild(consultasWrapper);
                containerDeactive.appendChild(consultasFind);
              }
            });
          }
        })
        .catch(function (error) {
          console.log(error.message);
        });
    }, 5000);
  }, 900);
});

function chatQuest() {
  try {
    let userMessage = document.getElementById("inputUser");
    if (userMessage.value) {
      addUser(userMessage.value);

      chatResponse(userMessage.value);
      userMessage.value = "";

      userMessage.placeholder = "";
    } else userMessage.placeholder = "Não esqueça de fazer uma pergunta";
  } catch (error) {}
}

function addUser(text) {
  let chatConversation = document.getElementsByClassName("chatConversation")[0];

  let userMessage = document.createElement("span");
  userMessage.classList.add("user", "chat");
  userMessage.textContent = text;

  chatConversation.appendChild(userMessage);
}

function addBot(text) {
  let chatConversation = document.getElementsByClassName("chatConversation")[0];

  let userMessage = document.createElement("span");
  userMessage.classList.add("bot", "chat");
  userMessage.textContent = text;

  chatConversation.appendChild(userMessage);
}

function chatResponse(userMessage) {
  fetch(`${location.origin}/chat/request`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      question: userMessage,
      id: user.accountid,
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      addBot(json.anwser);
    })
    .catch(function (error) {
      console.log(error.message);
    });
}

$(document).ready(function () {
  $("#inputUser").on("keydown", function (event) {
    if (event.key === "Enter" || event.keyCode === 13) {
      event.preventDefault();
      chatQuest();
    }
  });
});

function createOrUpdateImageUser() {
  var record = {};
  record.documentbody = "qwrqw"; // Text
  record.mimetype = "qwtq"; // Text
  record["objectid_account@odata.bind"] =
    "/accounts(4093de08-5d3d-ef11-a316-000d3a31e4dc)"; // Lookup

  fetch(
    Xrm.Utility.getGlobalContext().getClientUrl() +
      "/api/data/v9.2/annotations",
    {
      method: "POST",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Prefer: "odata.include-annotations=*",
      },
      body: JSON.stringify(record),
    }
  )
    .then(function success(response) {
      if (response.ok) {
        var uri = response.headers.get("OData-EntityId");
        var regExp = /\(([^)]+)\)/;
        var matches = regExp.exec(uri);
        var newId = matches[1];
        console.log(newId);
      } else {
        return response.json().then((json) => {
          throw json.error;
        });
      }
    })
    .catch(function (error) {
      console.log(error.message);
    });
}

$("[title]").tooltip({
  track: true,
  show: {
    effect: "slideDown",
    delay: 100,
  },
  hide: {
    effect: "slideUp",
  },
});

document.getElementById("userImage").addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", function () {
  debugger;
  const file = event.target.files[0];
  if (file && file.type.includes("image")) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      const base64String = e.target.result.split(",")[1];

      loading(true);
      await fetch(`${location.origin}/api/update`, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          record: {
            new_perfil: base64String,
          },
          userId: user.accountid,
          token: localStorage.getItem("token"),
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          loading(false);
          console.log(json);
          if (!json.erro) {
            user.new_perfil = base64String;

            document.getElementById(
              "userImage"
            ).src = `data:image/png;base64,${user.new_perfil}`;
            document.getElementById(
              "image_perfil"
            ).src = `data:image/png;base64,${user.new_perfil}`;
          }
        })
        .catch(function (error) {
          loading(false);
          openDialog(
            "Erro ao mudar imagem",
            "Perdão, porém a sua imagem não foi carregada, por favor, tente novamente"
          );
          console.log(error.message);
        });
    };
    reader.readAsDataURL(file);
  } else {
    openDialog(
      "Erro ao carregar a imagem",
      "Verifique se o arquivo selecionado realmente é uma imagem"
    );
  }

  this.value = "";
});

function openSection(id) {
  let element = document.getElementById(id);
  if (element.style.display === "none" || element.style.display === "") {
    element.style.display = "flex";
  } else {
    element.style.display = "none";
  }
}

function enviarArquivo() {
  document.getElementById("file_manager_input").click();
}

document
  .getElementById("file_manager_input")
  .addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file) {
      const fileType = file.type;
      const reader = new FileReader();

      reader.onload = function (event) {
        const base64 = event.target.result.split(",")[1];
        // const iframe = document.getElementById("fileIframe");
        let mimeType = "";

        if (fileType === "application/pdf") {
          mimeType = "application/pdf";
        } else if (
          fileType ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          mimeType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          convertFile("excel", base64);
        } else if (
          fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          mimeType =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          // convertAndDisplay(base64);
        } else if (fileType.startsWith("image/")) {
          mimeType = fileType;
        } else {
          openDialog(
            "Arquivo incorreto",
            "O tipo de arquivo não é suportado! Por favor, forneça imagens, pdf ou excel"
          );
          return;
        }

        // iframe.src = `data:${mimeType};base64,${base64}`;
      };

      reader.readAsDataURL(file);
    } else {
      openDialog("Selecione um arquivo", "Por favor, selecione um arquivo.");
    }
  });

async function convertFile(mimeType, base64) {
  loading(true);
  await fetch(`${location.origin}/api/fileConvert`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ mimeType, base64 }),
  })
    .then((response) => response.json())
    .then((json) => {
      loading(false);
      console.log(json);
      if (!json.erro) {
        const pdfDataUri = `data:application/pdf;base64,${json.file}`;
        document.getElementById("iframe_view").src = pdfDataUri;
      }
    })
    .catch(function (error) {
      loading(false);
      console.log(error.message);
    });
}

function changeView(view) {
  let containers = document.getElementsByClassName("container");
  let icons = document.getElementsByClassName("opIconsCell");
  let img = document.getElementsByClassName("help_doctor")[0];
  let opSpan = document.getElementsByClassName("opSpan");

  if (
    document.getElementsByClassName("search_view")[0].style.display == "none" ||
    document.getElementsByClassName("search_view")[0].style.display == ""
  )
    img.style.display = "block";

  for (let i = 0; i < icons.length; i++) {
    icons[i].classList.remove("active");
  }
  for (let i = 0; i < containers.length; i++) {
    containers[i].style.display = "none";
  }
  for (let i = 0; i < opSpan.length; i++) {
    opSpan[i].classList.remove("active");
  }

  if (view != 5) opSpan[view].classList.add("active");

  switch (view) {
    case 0:
      document.getElementById("calendar").style.display = "flex";
      document
        .getElementsByClassName("opIconsCell")
        [view].classList.add("active");
      break;
    case 1:
      document.getElementById("chat").style.display = "flex";
      document
        .getElementsByClassName("opIconsCell")
        [view].classList.add("active");
      break;
    case 2:
      document.getElementById("archive").style.display = "flex";
      document
        .getElementsByClassName("opIconsCell")
        [view].classList.add("active");
      img.style.display = "none";
      break;
    case 3:
      document.getElementById("planView").style.display = "flex";
      document
        .getElementsByClassName("opIconsCell")
        [view].classList.add("active");
      img.style.display = "none";
      openPlan();
      break;
    case 4:
      document.getElementById("settings").style.display = "flex";
      document
        .getElementsByClassName("opIconsCell")
        [view].classList.add("active");
      img.style.display = "none";
      break;
    case 5:
      document.getElementById("eventView").style.display = "flex";
      break;
  }
}

async function getAllServices() {
  loading(true);
  return new Promise((resolve, reject) => {
    fetch(
      `${location.origin}/api/service/get?token=${localStorage.getItem(
        "token"
      )}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    )
      .then((response) => response.json())
      .then((json) => {
        loading(false);
        if (json.erro) {
          if (json.message == "token expires") {
            openDialog(
              "Login",
              "Seu login expirou, por favor, faça o login novamente"
            );
            location.href = "/";
          } else {
            openDialog(
              "Algo deu errado",
              "Por favor, tente realizar o agendamente novamente, mais tarde"
            );
            $("#event").empty();
          }
        }
        debugger;
        resolve(
          json.response.map((item) => {
            return {
              new_name: item.new_name,
              new_servicoid: item.new_servicoid,
              new_descricao: item.new_descricao || "Descrição não disponível",
              accountsRelated: item.new_Account_new_Servico_new_Servico || null,
            };
          })
        );
      })
      .catch(function (error) {
        loading(false);
        resolve(null);
      });
  });
}

async function viewEvent(idEvent) {
  debugger;
  try {
    fetch(
      `${location.origin}/api/events/getById?token=${localStorage.getItem(
        "token"
      )}&id=${idEvent}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    )
      .then((response) => response.json())
      .then((json) => {
        if (json.erro) {
          loading(false);
          if (json.message == "token expires") {
            openDialog(
              "Login",
              "Seu login expirou, por favor, faça o login novamente"
            );
            location.href = "/";
          } else {
            openDialog(
              "Algo deu errado",
              "Por favor, tente realizar o agendamente novamente, mais tarde"
            );
            $("#event").empty();
          }
        } else {
          changeView(5);
          console.log(json);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  } catch {
    console.log("Erro");
  }
}

function openPlan() {
  fetch(`${location.origin}/api/getPlan`, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((json) => {
      loading(false);
      if (json.erro) {
      } else {
        let planView = document.getElementById("planView");
        // planView.innerHTML = "";
        console.log(json);
      }
    })
    .catch(function (error) {
      console.log(error.message);
    });
}
