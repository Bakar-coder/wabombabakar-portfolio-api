const mongoose = require('mongoose');
const Joi = require('joi');
const Schema = mongoose.Schema;
const resumeSchema = new Schema({
  email: { type: String, required: true, min: 3, max: 30 },
  resetToken: String,
  resetTokenExp: Date,
  createdAt: { type: Date, default: Date.now }
});

const validateResume = user => {
  const schema = {
    email: Joi.string()
      .email({ minDomainAtoms: 2 })
      .required(),
    resetToken: Joi.string(),
    resetTokenExp: Joi.date()
  };

  return Joi.validate(user, schema);
};

exports.Resume = mongoose.model('Resume', resumeSchema);
exports.validateResume = validateResume;
