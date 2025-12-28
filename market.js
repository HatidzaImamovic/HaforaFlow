// routes/market.js
import express from "express";
import {
  getMarketItems,
  createPurchase,
  getPurchaseHistory,
  getPurchaseDates,
  createMarketItem,
  deleteMarketItem,
  updateMarketItem,
  toggleMarketItemHidden
} from "../controllers/marketController.js";

const router = express.Router();

router.get("/items", getMarketItems);
router.post("/items", createMarketItem);
router.post("/purchase", createPurchase);
router.get("/history", getPurchaseHistory);
router.get("/history/dates", getPurchaseDates);
router.delete("/items/:id", deleteMarketItem);
router.put("/items/:id", updateMarketItem);
router.patch("/items/:id/hide", toggleMarketItemHidden);

export default router;
