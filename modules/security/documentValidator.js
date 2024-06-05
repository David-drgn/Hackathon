const { validator } = require("cpf-cnpj-validator");
//
const Joi = require("@hapi/joi").extend(validator);

const cnpjSchema = Joi.document().cnpj();
const cpfSchema = Joi.document().cpf();

// cpfSchema.validate('54271113107');
// cnpjSchema.validate('38313108000107');

class Validator {
  async validaCpf(cpf) {
    const validator = await cpfSchema.validate("187.044.327-62");
    if (!validator.error) console.log(true);
    else console.log(false);
  }
}

module.exports = Validator;
