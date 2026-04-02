import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initCronJobs } from "./src/services/cronService.js";
import cors from "cors";
dotenv.config();
connectDB();
initCronJobs();
app.use(cors({
  origin: "*",
}));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // reCAPTCHA keys updated, forcing reload
});
