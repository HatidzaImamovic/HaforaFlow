// server.js
import "dotenv/config";
import express from "express";             // <-- import instead of require
//import dotenv from "dotenv";               // <-- import instead of require
import cors from "cors";                   // <-- import instead of require
import itemRoutes from "./routes/items.js";
import authRoutes from "./routes/auth.js"; // <-- make sure auth.js uses ESM too
import orderRoutes from "./routes/orders.js";
import marketRoutes from "./routes/market.js";
import workerRoutes from "./routes/workers.js";

//dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());  // parse JSON request body

app.use("/api/auth", authRoutes);  // <--- this must match your frontend fetch URL
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/workers", workerRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





