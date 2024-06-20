const { validator } = require("cpf-cnpj-validator");
//
const Joi = require("@hapi/joi").extend(validator);

const cnpjSchema = Joi.document().cnpj();
const cpfSchema = Joi.document().cpf();

// cpfSchema.validate('54271113107');
// cnpjSchema.validate('38313108000107');

class Validator {
  async validaCpf(cpf) {
    const validator = await cpfSchema.validate(cpf);
    if (!validator.error) return true;
    return false;
  }
}

module.exports = Validator;
