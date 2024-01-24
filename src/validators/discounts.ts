import Joi from "joi";
import { IDiscount } from "types";

export const createDiscountSchema = async (
  createDiscountBody: IDiscount
): Promise<IDiscount> => {
  const schema = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
  });

  return await schema.validateAsync(createDiscountBody);
};
