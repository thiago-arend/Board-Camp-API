import { Router } from "express";
import { validateSchema } from "../middlewares/validadeSchema.js";
import { rentalsSchema } from "../schemas/rentals.schema.js";
import { createRental, deleteRental, getRentals } from "../controllers/rentals.controller.js";

const rentalsRouter = Router();

rentalsRouter.post("/rentals", validateSchema(rentalsSchema), createRental);
rentalsRouter.get("/rentals", getRentals);
rentalsRouter.delete("/rentals/:id", deleteRental);

export default rentalsRouter;