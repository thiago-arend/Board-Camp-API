import { Router } from "express";
import { validateSchema } from "../middlewares/validadeSchema.js";
import { customersSchema } from "../schemas/customers.schema.js";
import { createCustomer, getCustomers } from "../controllers/customers.controller.js";

const customersRouter = Router();

customersRouter.post("/customers", validateSchema(customersSchema), createCustomer);
customersRouter.get("/customers", getCustomers);

export default customersRouter;