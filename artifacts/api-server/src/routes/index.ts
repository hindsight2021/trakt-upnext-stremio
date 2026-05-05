import { Router, type IRouter } from "express";
import healthRouter from "./health";
import traktRouter from "./trakt";
import stremioRouter from "./stremio";

const router: IRouter = Router();

router.use(healthRouter);
router.use(traktRouter);
router.use(stremioRouter);

export default router;
