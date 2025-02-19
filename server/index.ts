import express from "express";
import { config } from "dotenv";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import cookieParser from "cookie-parser"; 

config(); 

const app = express();

app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true, limit: "10mb" })); 
app.use(cookieParser()); 
app.use("/api/v1/user", userRoutes); 

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
