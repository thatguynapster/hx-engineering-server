import Joi from "joi";
import { IProduct } from "models/products";
// import { IProduct } from "types";

export const createProductSchema = async (
  createProductBody: IProduct
): Promise<IProduct> => {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    details: Joi.string().required(),
    images: Joi.array().items(Joi.string()).min(1).required(),
    features: Joi.object().keys().unknown(true),
    category: Joi.string().required(),
    quantity: Joi.number().required(),
  });

  return await schema.validateAsync(createProductBody);
};

export const updateProductSchema = async (
  updateProductBody: IProduct
): Promise<IProduct> => {
  const schema = Joi.object({
    name: Joi.string(),
    price: Joi.string(),
    details: Joi.string(),
    images: Joi.array().items(Joi.string()).min(1),
    features: Joi.object().keys().unknown(true),
    category: Joi.string(),
    quantity: Joi.string(),
  });

  return await schema.validateAsync(updateProductBody);
};
