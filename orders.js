import express from "express";
import {
  createCafeOrder,
  getCafeOrderHistory,
  updateCafeOrderStatus,
  getCafeOrderDates,
} from "../controllers/ordersController.js";

const router = express.Router();

// instead of router.post("/orders", ...) just use:
router.post("/", createCafeOrder);
router.get("/history", getCafeOrderHistory);
router.get("/history/dates", getCafeOrderDates);
router.patch("/:id/status", updateCafeOrderStatus);

export default router;
