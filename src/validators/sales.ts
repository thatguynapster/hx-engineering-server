import Joi from "joi";
import { ISales } from "types";

export const createSalesSchema = async (
  createSalesBody: ISales
): Promise<ISales> => {
  const schema = Joi.object({
    discount: Joi.string(),
    products: Joi.array().items(Joi.string()).min(1).required(),
  });

  return await schema.validateAsync(createSalesBody);
};
