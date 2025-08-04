const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.alternatives().try(
      Joi.object({
        url: Joi.string().uri().required(),
        filename: Joi.string().required()
      }),
      Joi.string().uri(),
      Joi.string().allow('', null)  // handle cases where form sends an empty string
    ).optional()
  }).required()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
  }).required(),
});
