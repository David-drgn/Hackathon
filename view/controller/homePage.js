$(document).ready(function () {
  $("#header").load("../assets/includes/headerLogado.html");

  let container = $("#chatConversation");

  function scrollToBottom() {
    container.scrollTop(container[0].scrollHeight);
  }

  const observer = new MutationObserver(scrollToBottom);
  observer.observe(container[0], { childList: true, subtree: true });
});

let viewCalendar = 1;
window.addEventListener("load", async () => {
  let calendarEl = document.getElementById("calendar");
  let calendar = new FullCalendar.Calendar(calendarEl, {
    timeZone: "UTC",
    initialView: "dayGridMonth",
    // initialView: "dayGridMonth",
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
    events: [
      {
        id: "id",
        title: "The Title", // a property!
        start: "2024-07-01", // a property!
        end: "2024-07-02", // a property! ** see important note below about 'end' **
      },
    ],
    locale: "pt-br",
    selectable: true,
    headerToolbar: {
      left: "ant today prox",
      center: "title",
      right: "view",
    },
    // footerToolbar: {
    //   left: "prev today",
    //   center: "title",
    //   right: "next",
    // },
    select: function (info) {
      if (new Date(info.startStr).getTime() > new Date().getTime()) {
        alert("selected " + info.startStr + " to " + info.endStr);
      }
    },
    eventClick: function (info) {
      console.log(info.event);
    },
  });
  calendar.render();
});

function changeView(view) {
  let containers = document.getElementsByClassName("container");
  let img = document.getElementsByClassName("help_doctor")[0];
  img.style.display = "block";

  for (let i = 0; i < containers.length; i++) {
    containers[i].style.display = "none";
  }

  switch (view) {
    case 0:
      document.getElementById("calendar").style.display = "flex";
      break;
    case 1:
      document.getElementById("chat").style.display = "flex";
      break;
    case 2:
      document.getElementById("archive").style.display = "flex";
      break;
    case 3:
      document.getElementById("plan").style.display = "flex";
      break;
    case 4:
      document.getElementById("settings").style.display = "flex";
      img.style.display = "none";
      break;
  }
}

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
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64String = e.target.result.split(",")[1];
      $("#base64Output").text(base64String);
      alert("Base64 string:\n" + base64String);
    };
    reader.readAsDataURL(file);
  }
});
