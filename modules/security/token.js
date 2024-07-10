const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRETKEY;

class Token {
  async createToken(data, check) {
    return await jwt.sign(
      {
        data,
      },
      secretKey,
      { expiresIn: check ? "1 year" : "1h" }
    );
  }

  async verifyToken(token) {
    try {
      let user;
      await jwt.verify(token, secretKey, function (err, decoded) {
        user = decoded.data.user;
      });
      return user;
    } catch {
      return null;
    }
  }
}

module.exports = Token;
