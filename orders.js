import express from "express";
import { 
  createOrder, 
  updateOrder, 
  getPendingOrders, 
  getHistoryOrders,
  getOrderDates 
} from "../controllers/ordersController.js";

const router = express.Router();

router.get("/dates", getOrderDates);
router.get("/pending", getPendingOrders);
router.get("/history", getHistoryOrders);
router.post("/", createOrder);
router.put("/:id", updateOrder);

export default router;
