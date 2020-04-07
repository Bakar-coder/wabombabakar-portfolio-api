const mongoose = require('mongoose');
const Joi = require('joi');
const Schema = mongoose.Schema;
const messageSchema = new Schema({
  name: { type: String, required: true, min: 3, max: 30 },
  phone: { type: Number, required: true },
  company: { type: String },
  email: { type: String, required: true, lowercase: true },
  msg: [{ type: String, required: true }],
  sentAt: { type: Date, default: Date.now }
});

const validateMessage = msg => {
  const schema = {
    name: Joi.string().required(),
    phone: Joi.string().required(),
    company: Joi.string(),
    email: Joi.string()
      .email({ minDomainAtoms: 2 })
      .required(),
    msg: Joi.string().required()
  };

  return Joi.validate(msg, schema);
};

exports.Message = mongoose.model('Message', messageSchema);
exports.validateMessage = validateMessage;
