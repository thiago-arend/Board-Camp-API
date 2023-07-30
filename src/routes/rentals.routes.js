import { Router } from "express";
import { validateSchema } from "../middlewares/validadeSchema.js";
import { rentalsSchema } from "../schemas/rentals.schema.js";
import { createRental, deleteRental, getRentals, returnRental } from "../controllers/rentals.controller.js";

const rentalsRouter = Router();

rentalsRouter.post("/rentals", validateSchema(rentalsSchema), createRental);
rentalsRouter.get("/rentals", getRentals);
rentalsRouter.delete("/rentals/:id", deleteRental);
rentalsRouter.post("/rentals/:id/return", returnRental);

export default rentalsRouter;