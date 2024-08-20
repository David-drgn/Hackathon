const rp = require("request-promise-native");

class Plan {
  token;

  constructor(token) {
    this.token = token;
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      try {
        fetch(
          `${process.env.BASE_REQUEST_URL}/api/data/v9.2/new_planos?$select=new_beneficios,new_desconto,new_name,new_valor,new_valortotal,new_descricao&$filter=statecode eq 0`,
          {
            method: "GET",
            headers: {
              "OData-MaxVersion": "4.0",
              "OData-Version": "4.0",
              "Content-Type": "application/json; charset=utf-8",
              Accept: "application/json",
              Prefer: "odata.include-annotations=*",
              Authorization: "Bearer " + this.token,
            },
          }
        )
          .then(function success(response) {
            return response.json().then((json) => {
              if (response.ok) {
                return [response, json];
              } else {
                throw json.error;
              }
            });
          })
          .then(function (responseObjects) {
            var response = responseObjects[0];
            var responseBody = responseObjects[1];
            var results = responseBody;
            let data = [];
            for (var i = 0; i < results.value.length; i++) {
              var result = results.value[i];
              // Columns

              data.push({
                id: result["new_planoid"],
                beneficios: result["new_beneficios"],
                beneficiosDesc:
                  result[
                    "new_beneficios@OData.Community.Display.V1.FormattedValue"
                  ],
                desconto: result["new_desconto"],
                plano: result["new_name"],
                descricao: result["new_descricao"],
                valor: result["new_valor"],
                valorTotal: result["new_valortotal"],
              });
            }
            resolve(data);
          })
          .catch(function (error) {
            console.log(error.message);
          });
      } catch (error) {
        resolve(null);
      }
    });
  }
}

module.exports = Plan;
