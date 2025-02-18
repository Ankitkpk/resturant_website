import express from 'express';
import bodyParser from 'body-parser'; 
import { config } from 'dotenv'; 
import connectDB from './config/db'



config();
const app = express();
app.use(bodyParser.json()); 

const PORT = process.env.PORT || 3000; 
connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});