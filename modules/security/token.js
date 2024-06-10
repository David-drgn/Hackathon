const jwt = require("jsonwebtoken");

const secretKey = "z5j8e7KrTX";

class Token {
  async createToken(data, ) {
    return await jwt.sign(
      {
        data,
      },
      secretKey,
      { expiresIn: "1h" }
    );
  }

  async verifyToken(token) {
    jwt.verify(token, secretKey, function (err, decoded) {
      console.log(decoded.data);
    });
  }
}

module.exports = Token;
