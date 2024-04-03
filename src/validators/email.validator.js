import Joi from "joi";

// Joi schema for validating email addresses
const emailSchema = Joi.string().email().required();

// Validate an email address using Joi schema
const validateEmail = (email) => {
    return emailSchema.validate(email);
};

export { validateEmail };
