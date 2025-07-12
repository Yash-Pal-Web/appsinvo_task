const Joi = require('joi');

const registerUser = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      'any.required': 'name is required',
      'string.empty': 'name is required',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'any.required': 'email is required',
      'string.empty': 'email is required',
      'string.email': 'email must be a valid email',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'password is required',
      'string.empty': 'password is required',
    }),
  address: Joi.string()
    .required()
    .messages({
      'any.required': 'address is required',
      'string.empty': 'address is required',
    }),
  latitude: Joi.number()
    .required()
    .messages({
      'any.required': 'latitude is required',
      'number.base': 'latitude must be a number',
    }),
  longitude: Joi.number()
    .required()
    .messages({
      'any.required': 'longitude is required',
      'number.base': 'longitude must be a number',
    }),
});

module.exports = { registerUser };
