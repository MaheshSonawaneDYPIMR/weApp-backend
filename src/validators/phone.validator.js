// validators/phoneValidator.js
import Joi from "joi";
import validator from "validator";
// Joi schema for validating phone numbers
const phoneSchema = Joi.string().custom((value, helpers) => {
    if (!validator.isMobilePhone(value, 'any')) {
        return helpers.message('Invalid phone number format');
    }
    return value;
});

// Validate a phone number using Joi schema
const validatePhone = (phone) => {
    return phoneSchema.validate(phone);
};

export {validatePhone}
