const rp = require("request-promise-native");

class Service {
    token;

    constructor(token) {
        this.token = token;
    }

    async createRelation(accountId, serviceId) {
        try {
            return new Promise((resolve, reject) => {
                fetch(`${process.env.BASE_REQUEST_URL}/api/data/v9.0/new_servicos(${serviceId})/new_Account_new_Servico_new_Servico/$ref`, {
                        method: "POST",
                        headers: {
                            "OData-MaxVersion": "4.0",
                            "OData-Version": "4.0",
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Prefer: "odata.include-annotations=*",
                            Authorization: "Bearer " + this.token,
                        },
                        body: JSON.stringify({
                            '@odata.id': `https://newproject.crm.dynamics.com/api/data/v9.0/accounts(${accountId})`
                        }),
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(json => {
                                throw json.error;
                            });
                        }
                        return response.text().then(text => text ? JSON.parse(text) : {});
                    })
                    .then(responseBody => {
                        console.log(responseBody);

                        resolve({
                            erro: false,
                            message: "Relacionamento feito",
                            data: responseBody
                        });
                    })
                    .catch(e => {
                        resolve({
                            erro: true,
                            message: "Ocorreu algum erro inesperado, por favor, tente novamente",
                            e,
                        });
                    });
            })
        } catch (e) {
            resolve({
                erro: true,
                message: "Ocorreu algum erro inesperado, por favor, tente novamente",
                e,
            });
        }
    }

    async deleteRelation(accountId, serviceId) {
        try {
            return new Promise((resolve, reject) => {
                fetch(`${process.env.BASE_REQUEST_URL}/api/data/v9.0/new_servicos(${serviceId})/new_Account_new_Servico_new_Servico(${accountId})/$ref`, {
                        method: "DELETE",
                        headers: {
                            "OData-MaxVersion": "4.0",
                            "OData-Version": "4.0",
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Prefer: "odata.include-annotations=*",
                            Authorization: "Bearer " + this.token,
                        },
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(json => {
                                throw json.error;
                            });
                        }
                        return response.text().then(text => text ? JSON.parse(text) : {});
                    })
                    .then(responseBody => {
                        console.log(responseBody);

                        resolve({
                            erro: false,
                            message: "Relacionamento feito",
                            data: responseBody
                        });
                    })
                    .catch(e => {
                        resolve({
                            erro: true,
                            message: "Ocorreu algum erro inesperado, por favor, tente novamente",
                            e,
                        });
                    });
            })
        } catch (e) {
            resolve({
                erro: true,
                message: "Ocorreu algum erro inesperado, por favor, tente novamente",
                e,
            });
        }
    }
}

module.exports = Service