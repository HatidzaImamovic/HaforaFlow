import express from "express";
import {
  getItems,
  createCafeItem,
  deleteCafeItem,
  updateCafeItem,
  toggleCafeItemHidden
} from "../controllers/itemsController.js";

const router = express.Router();

router.get("/category/:category", getItems);
router.get("/", getItems);
router.post("/", createCafeItem);
router.put("/:id", updateCafeItem);
router.delete("/:id", deleteCafeItem);
router.patch("/:id/hide", toggleCafeItemHidden);


export default router;
