import express from "express";
import { getWorkers, createWorker, deleteWorker, updateWorker, archiveWorker } from "../controllers/workerController.js";

const router = express.Router();

router.get("/", getWorkers);
router.post("/", createWorker);
router.put("/:id", updateWorker);
router.delete("/:id", deleteWorker);
router.patch("/:id/archive", archiveWorker);

export default router;
