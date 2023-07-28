import { Router } from "express";
import { createGame, getGames } from "../controllers/games.controller.js";
import { validateSchema } from "../middlewares/validadeSchema.js";
import { gamesSchema } from "../schemas/games.schema.js";

const gamesRouter = Router();

gamesRouter.post("/games", validateSchema(gamesSchema), createGame);
gamesRouter.get("/games", getGames);

export default gamesRouter;