import { Router } from "express";
import { validateSchema } from "../middlewares/validadeSchema.js";
import { rentalsSchema } from "../schemas/rentals.schema.js";
import { createRental, getRentals } from "../controllers/rentals.controller.js";

const rentalsRouter = Router();

rentalsRouter.post("/rentals", validateSchema(rentalsSchema), createRental);
rentalsRouter.get("/rentals", getRentals);

export default rentalsRouter;