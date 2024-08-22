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
        user.expiresIn = decoded.exp;
        user.createIn = decoded.iat;
      });
      return user;
    } catch {
      return null;
    }
  }

  async createTokenWithExpires(data, expires) {
    return await jwt.sign(
      {
        data,
      },
      secretKey,
      { expiresIn: expires }
    );
  }
}

module.exports = Token;
