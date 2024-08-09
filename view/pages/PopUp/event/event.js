function cancel() {
  $("#event").empty();
}

function next() {
  let steps = document.getElementsByClassName("step");

  steps[1].style.display = "flex";
}

function final(x) {
  if (x) {
    document.getElementsByClassName("final")[0].style.display = "block";
    document.getElementsByClassName("final")[1].style.display = "block";
  } else {
    document.getElementsByClassName("final")[0].style.display = "none";
    document.getElementsByClassName("final")[1].style.display = "none";
  }
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
  console.log(new Date(`${ano}-${mes}-${dia}`));
  return new Date(`${ano}-${mes}-${dia}`);
}

document
  .getElementById("timePrestador")
  .addEventListener("change", function () {
    final(true);
    if (this.value > document.getElementById("timePrestadorFinal").value) {
      final(false);
      openDialog(
        "Horários",
        "Peço desculpas, mas os horários não correspondem. Por favor, revise os horários"
      );
      document.getElementById("timePrestadorFinal").value = this.value;
    }
  });

document
  .getElementById("timePrestadorFinal")
  .addEventListener("change", function () {
    final(true);
    if (this.value < document.getElementById("timePrestador").value) {
      final(false);
      openDialog(
        "Horários",
        "Perdão, porém os horários não condizem, por favor, verifique o horário"
      );
      document.getElementById("timePrestador").value = this.value;
    }
  });

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
          next();

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

              document.getElementsByClassName("one")[0].style.display = "flex";
            } else {
              document.getElementsByClassName("one")[0].style.display = "none";
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

              document
                .getElementById("finalizarAgenda")
                .addEventListener("click", () => {
                  let data = document.getElementById("dataDisponivel");
                  let horario = document.getElementById("time");
                  let local = document.getElementById("local");

                  if (
                    this.value != "none" &&
                    local.value != "" &&
                    horario.value != "" &&
                    data.value != "none"
                  ) {
                    const datas =
                      document.getElementById("dataDisponivel").value;

                    const dataInicial = `${datas.split("T")[0]} ${
                      document.getElementById("time").value
                    }`;
                    let dataFinal = `${datas.split("T")[0]} ${
                      document.getElementById("time").value
                    }`;

                    let date = new Date(dataFinal);
                    date.setMinutes(date.getMinutes() + 30);
                    const horas = String(date.getHours()).padStart(2, "0");
                    const minutos = String(date.getMinutes()).padStart(2, "0");
                    const novaHora = `${horas}:${minutos}`;

                    dataFinal = `${datas.split("T")[0]} ${novaHora}`;

                    agendaClientRegister(
                      { dataFinal, dataInicial },
                      prestadorSelected.id
                    );
                  }
                });

              document.getElementById("local").value =
                prestadorSelected.endereco;

              if (!prestadorSelected.domicilio) {
                document.getElementById("local").disabled = false;
              }

              let selectElementDate = document.getElementById("dataDisponivel");

              selectElementDate.innerHTML = `
                <option value="none">Selecione uma data</option>
                `;

              let horariosUtilizados = prestadorSelected.agenda.filter(
                (e) => e.tipo !== 1
              );
              prestadorSelected.agenda = prestadorSelected.agenda.filter(
                (e) => e.tipo === 1
              );

              for (let i = 0; i < prestadorSelected.agenda.length; i++) {
                debugger;
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
                  // selectElementDate.disabled = true;
                  document.getElementById("dontFind").style.display = "none";
                  selectElementDateSelect();
                  i = prestadorSelected.agenda.length;
                }
              }

              function selectElementDateSelect() {
                let agendaDisponivel = prestadorSelected.agenda.find(
                  (e) => e.livre === selectElementDate.value
                );

                let startDate = new Date(agendaDisponivel.livre).getTime();
                // let endDate = new Date(agendaDisponivel.termino).getTime();

                let selectElementHour = document.getElementById("time");
                selectElementHour.innerHTML = "";

                function addOption(value) {
                  let option = document.createElement("option");
                  option.value = value;
                  option.text = value;
                  selectElementHour.appendChild(option);
                }

                let currentDate = new Date(startDate);

                // currentDate.setUTCMinutes(
                //   currentDate.getUTCMinutes() +
                //     (30 - (currentDate.getUTCMinutes() % 30))
                // );
                // currentDate.setUTCSeconds(0, 0);

                currentDate.setHours(currentDate.getHours() + 3);
                let terminoDate = new Date(agendaDisponivel.termino);

                terminoDate.setHours(terminoDate.getHours() + 3);

                let endDate = terminoDate.getTime();

                while (currentDate <= endDate) {
                  debugger;

                  let hasMatchingDate = false;

                  horariosUtilizados.forEach((e) => {
                    let livreDate = new Date(e.livre);
                    livreDate.setHours(livreDate.getHours() + 3);
                    if (currentDate.getTime() == livreDate.getTime())
                      hasMatchingDate = true;
                  });

                  if (hasMatchingDate) {
                    console.log("Horário já utilizado");
                  } else {
                    let hours = (currentDate.getUTCHours() - 3)
                      .toString()
                      .padStart(2, "0");
                    if (hours < 0) {
                      hours = (24 + parseInt(hours))
                        .toString()
                        .padStart(2, "0");
                    }
                    let minutes = currentDate
                      .getUTCMinutes()
                      .toString()
                      .padStart(2, "0");
                    addOption(`${hours}:${minutes}`);
                  }
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

function viewInfo(dados) {
  $("#infoUser").empty();
  $(document).ready(function () {
    $("#infoUser").load("/pages/PopUp/info/info.html", function () {});
  });
}

async function registerHorarioLivre() {
  debugger;
  const datas = document
    .getElementById("dateSelectMedico")
    .textContent.split(" à ");

  const [dia, mes, ano] = datas[0].split("/");
  const dataInicial = `${ano}-${mes}-${dia} ${
    document.getElementById("timePrestador").value
  }`;
  let dataFinal = `${ano}-${mes}-${dia} ${
    document.getElementById("timePrestadorFinal").value
  }`;
  if (datas[1] != undefined) {
    const [dia, mes, ano] = datas[1].split("/");

    dataFinal = `${ano}-${mes}-${dia} ${
      document.getElementById("timePrestadorFinal").value
    }`;

    const datasEntre = gerarDatasEntre(
      dataInicial.split(" ")[0],
      `${ano}-${mes}-${dia}`
    );

    for (let i = 0; i < datasEntre.length; i++) {
      const element = datasEntre[i];
      agendaLivreRegister({
        dataFinal: `${element.toISOString().split("T")[0]} ${
          document.getElementById("timePrestadorFinal").value
        }`,
        dataInicial: `${element.toISOString().split("T")[0]} ${
          document.getElementById("timePrestador").value
        }`,
      });
    }
  } else {
    agendaLivreRegister({ dataFinal, dataInicial });
  }
}

function gerarDatasEntre(inicio, fim) {
  let datas = [];
  let dataAtual = new Date(inicio);
  let dataFim = new Date(fim);

  while (dataAtual <= dataFim) {
    datas.push(new Date(dataAtual));
    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  return datas;
}

function agendaLivreRegister(datas) {
  fetch(`${location.origin}/api/events/livreRegister`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      token: localStorage.getItem("token"),
      record: {
        new_data_agendada: new Date(datas.dataInicial).toISOString(),
        new_dataterminoagenda: new Date(datas.dataFinal).toISOString(),
        ["new_Prestador@odata.bind"]: `/accounts(${user.accountid})`,
        new_tipohorario: 1,
      },
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
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

function agendaClientRegister(datas, idPrestador) {
  debugger;
  fetch(`${location.origin}/api/events/agendaRegister`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      token: localStorage.getItem("token"),
      record: {
        new_data_agendada: new Date(datas.dataInicial).toISOString(),
        new_dataterminoagenda: new Date(datas.dataFinal).toISOString(),
        ["new_Cliente@odata.bind"]: `/accounts(${user.accountid})`,
        ["new_Prestador@odata.bind"]: `/accounts(${idPrestador})`,
        new_local: document.getElementById("local").value,
        new_tipohorario: 2,
        ["new_Servico@odata.bind"]: `/new_servicos(${
          document.getElementById("selectOptions").value
        })`,
      },
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
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
