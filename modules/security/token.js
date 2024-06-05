const jwt = require("jsonwebtoken");

const secretKey = "z5j8e7KrTX";

class Token {
  async createToke() {
    return await jwt.sign(
      {
        data: "foobar",
      },
      secretKey,
      { expiresIn: "1h" }
    );
  }

  async verifyToken(token) {
    jwt.verify(token, secretKey, function (err, decoded) {
      console.log(decoded.foo);
    });
  }
}

module.exports = Token;
