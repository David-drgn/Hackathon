const rp = require("request-promise-native");

class Connect {
  token;

  async initialize() {
    let requestNow = await this.connect();
    if (requestNow != null) this.token = requestNow;
  }

  async connect() {
    var options = {
      method: "POST",
      url:
        "https://login.microsoftonline.com/e35fd86c-d440-44e9-ac11-d6664b6b15b1/oauth2/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie:
          "fpc=Atqk-OfbgPtGu8wPFQ2j14vyoDRzAQAAAJlUn90OAAAA; stsservicecookie=estsfd; x-ms-gateway-slice=estsfd",
      },
      form: {
        client_id: "d2611b85-13b9-440c-a029-2f86a24ad48b",
        client_secret: "y.u8Q~Xj3laOa6IHra1gKxZlCvpjozLx1PSIgcuN",
        grant_type: "client_credentials",
        resource: `${process.env.BASE_REQUEST_URL}`,
      },
    };
    try {
      const response = await rp(options);
      return JSON.parse(response).access_token;
    } catch (error) {
      console.error("Error fetching token:", error);
      return null;
    }
  }
}

module.exports = Connect;
