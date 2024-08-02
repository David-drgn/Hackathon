function cancel() {
  $("#event").empty();
}

function next() {
  let steps = document.getElementsByClassName("step");

  document.getElementsByClassName("final")[0].style.display = "block";

  steps[1].style.display = "flex";
}

function parseDateString(dateString) {
  let parts = dateString.split("/");
  let day = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10) - 1;
  let year = parseInt(parts[2], 10);

  return new Date(year, month, day);
}

function transformarData(dataString) {
  const [dia, mes, ano] = dataString.split("/");
  return new Date(`${ano}-${mes}-${dia}`);
}

document
  .getElementById("selectOptions")
  .addEventListener("change", async function () {
    if (this.value != "none") {
      loading(true);
      fetch(`${location.origin}/api/service/getAccounts`, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          serviceId: this.value,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          loading(false);
          debugger;
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

          for (let i = 0; i < json.response.length; i++) {
            debugger;
            const element = json.response[i];
            element.agenda = element.agenda.filter(
              (e) =>
                new Date(e.livre) >=
                transformarData(document.getElementById("dateSelect").innerText)
            );
            if (element.agenda.length == 0) {
              json.response = json.response.filter((e) => e !== element);
              i -= 1;
            }
          }

          let selectElement = document.getElementById("prestador");
          selectElement.innerHTML = `
          <option value="none">Selecione um prestador</option>
          `;

          json.response.forEach((element) => {
            let option = document.createElement("option");

            option.value = element.id;
            option.title = element.name;
            option.text = element.name;

            selectElement.add(option);
            next();
          });

          selectElement.addEventListener("change", function () {
            if (this.value == "none") {
              let finalStep = document.getElementsByClassName(
                "prestadorSelecionado"
              );

              for (let i = 0; i < finalStep.length; i++) {
                const element = finalStep[i];
                element.style.display = "none";
              }
            } else {
              let finalStep = document.getElementsByClassName(
                "prestadorSelecionado"
              );

              for (let i = 0; i < finalStep.length; i++) {
                const element = finalStep[i];
                element.style.display = "block";
              }

              let prestadorSelected = json.response.find(
                (e) => e.id === this.value
              );

              let selectElementDate = document.getElementById("dataDisponivel");

              selectElementDate.innerHTML = `
                <option value="none">Selecione uma data</option>
                `;

              for (let i = 0; i < prestadorSelected.agenda.length; i++) {
                const agendaDisponivel = prestadorSelected.agenda[i];

                let optionElement = document.createElement("option");

                let datePart = agendaDisponivel.livre.split("T")[0];
                let [year, month, day] = datePart.split("-");

                optionElement.text = `${day}/${month}/${year}`;
                optionElement.value = agendaDisponivel.livre;

                selectElementDate.appendChild(optionElement);
                if (
                  optionElement.text ===
                  document.getElementById("dateSelect").innerText
                ) {
                  selectElementDate.value = optionElement.value;
                  selectElementDate.disabled = true;
                  document.getElementById("dontFind").style.display = "none";
                  selectElementDateSelect();
                }
              }

              function selectElementDateSelect() {
                let agendaDisponivel = prestadorSelected.agenda.find(
                  (e) => e.livre === selectElementDate.value
                );

                let startDate = new Date(agendaDisponivel.livre).getTime();
                let endDate = new Date(agendaDisponivel.termino).getTime();

                let selectElementHour = document.getElementById("time");
                selectElementHour.innerHTML = "";

                function addOption(value) {
                  let option = document.createElement("option");
                  option.value = value;
                  option.text = value;
                  selectElementHour.appendChild(option);
                }

                let currentDate = new Date(startDate);

                currentDate.setUTCMinutes(
                  currentDate.getUTCMinutes() +
                    (30 - (currentDate.getUTCMinutes() % 30))
                );
                currentDate.setUTCSeconds(0, 0);

                while (currentDate <= endDate) {
                  let hours = (currentDate.getUTCHours() - 3)
                    .toString()
                    .padStart(2, "0");
                  if (hours < 0) {
                    hours = (24 + parseInt(hours)).toString().padStart(2, "0");
                  }
                  let minutes = currentDate
                    .getUTCMinutes()
                    .toString()
                    .padStart(2, "0");
                  addOption(`${hours}:${minutes}`);
                  currentDate.setUTCMinutes(currentDate.getUTCMinutes() + 30);
                }
              }

              selectElementDate.addEventListener("change", function () {
                selectElementDateSelect();
              });
            }
          });
        })
        .catch(function (error) {
          loading(false);
          openDialog(
            "Algo deu errado",
            "Por favor, tente realizar o agendamente novamente, mais tarde"
          );
          $("#event").empty();
          console.log("Erro: " + error.message);
        });
    }
  });

function viewInfo() {
  $("#infoUser").empty();
  $(document).ready(function () {
    $("#infoUser").load("/pages/PopUp/info/info.html", function () {});
  });
}

viewInfo();
