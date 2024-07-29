$(document).ready(function() {
    $("#header").load("/pages/headers/home/header.html", function() {
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
                    console.log(json);
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
                    if (user.new_tipodaconta == 0) {
                        document.getElementById("plan").style.display = "none";
                        document.getElementById("userplan").style.display = "none";
                    }
                })
                .catch(function(error) {
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

let viewCalendar = 1;
window.addEventListener("load", async() => {
    let calendarEl = document.getElementById("calendar");
    let calendar = new FullCalendar.Calendar(calendarEl, {
        timeZone: "UTC",
        initialView: "dayGridMonth",
        titleFormat: { year: "numeric", month: "long" },
        customButtons: {
            view: {
                text: "Trocar visualização",
                click: function() {
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
                click: function() {
                    calendar.today();
                },
            },
            prox: {
                text: "Próximo",
                icon: "chevron-right",
                click: function() {
                    calendar.next();
                },
            },
            ant: {
                text: "Anterior",
                icon: "chevron-left",
                click: function() {
                    calendar.prev();
                },
            },
        },
        events: [{
            id: "id",
            title: "The Title",
            start: "2024-07-01",
            end: "2024-07-02",
        }, ],
        locale: "pt-br",
        selectable: true,
        headerToolbar: {
            left: "ant today prox",
            center: "title",
            right: "view",
        },
        dateClick: function(info) {
            if (info.date.getTime() > new Date().getTime()) {
                // alert("selected " + info.startStr + " to " + info.endStr)
                $("#event").empty();
                $(document).ready(function() {
                    $("#event").load("/pages/PopUp/event/event.html", function() {
                        document.getElementById("dateSelect").textContent = `${info.dateStr}`
                    });
                });
            }
        },
        select: function(info) {
            if (info.start.getTime() > new Date().getTime()) {
                if (((info.end.getTime() - info.start.getTime()) / (1000 * 3600 * 24)) >= 2) {
                    $("#event").empty();
                    $(document).ready(function() {
                        $("#event").load("/pages/PopUp/event/event.html", function() {
                            if (info.startStr == info.endStr) document.getElementById("dateSelect").textContent = info.startStr
                            else document.getElementById("dateSelect").textContent = `${info.startStr} à ${info.endStr}`
                        });
                    });
                }
            }
        }
    });
    calendar.render();
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
        .catch(function(error) {
            console.log(error.message);
        });
}

$(document).ready(function() {
    $("#inputUser").on("keydown", function(event) {
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
            "/api/data/v9.2/annotations", {
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
        .catch(function(error) {
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

document.getElementById("fileInput").addEventListener("change", function() {
    debugger;
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64String = e.target.result.split(",")[1];
            $("#base64Output").text(base64String);
            alert("Base64 string:\n" + base64String);
        };
        reader.readAsDataURL(file);
    }
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

            reader.onload = function(event) {
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
        .catch(function(error) {
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

    opSpan[view].classList.add("active");

    switch (view) {
        case 0:
            document.getElementById("calendar").style.display = "flex";
            document
                .getElementsByClassName("opIconsCell")[view].classList.add("active");
            break;
        case 1:
            document.getElementById("chat").style.display = "flex";
            document
                .getElementsByClassName("opIconsCell")[view].classList.add("active");
            break;
        case 2:
            document.getElementById("archive").style.display = "flex";
            document
                .getElementsByClassName("opIconsCell")[view].classList.add("active");
            img.style.display = "none";
            break;
        case 3:
            document.getElementById("plan").style.display = "flex";
            document
                .getElementsByClassName("opIconsCell")[view].classList.add("active");
            break;
        case 4:
            document.getElementById("settings").style.display = "flex";
            document
                .getElementsByClassName("opIconsCell")[view].classList.add("active");
            img.style.display = "none";
            break;
    }
}