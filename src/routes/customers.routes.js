import { Router } from "express";
import { validateSchema } from "../middlewares/validadeSchema.js";
import { customersSchema } from "../schemas/customers.schema.js";
import { createCustomer, getCustomer, getCustomers, updateCustomer } from "../controllers/customers.controller.js";

const customersRouter = Router();

customersRouter.post("/customers", validateSchema(customersSchema), createCustomer);
customersRouter.get("/customers", getCustomers);
customersRouter.get("/customers/:id", getCustomer);
customersRouter.put("/customers/:id", validateSchema(customersSchema), updateCustomer);

export default customersRouter;