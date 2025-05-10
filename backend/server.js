import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import mongoose from 'mongoose';
import adminRouter from "./routes/adminRoute.js"
import hospitalRouter from "./routes/hospitalRoutes.js"

// Debug logging for environment variables
console.log("Environment Variables Check:");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Present" : "Missing");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "Present" : "Missing");
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "Present" : "Missing");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "Present" : "Missing");

const app = express()
const port = process.env.PORT || 4000

// Connect to MongoDB
connectDB()
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Connect to Cloudinary
let cloudinaryConnected = false;
connectCloudinary()
  .then(() => {
    console.log("Cloudinary Connected");
    cloudinaryConnected = true;
  })
  .catch(err => {
    console.error("Cloudinary connection error:", err);
    console.log("Warning: Cloudinary connection failed. Some features may not work.");
    cloudinaryConnected = false;
  });

app.use(express.json())
app.use(cors())

// Add cloudinary status to request object
app.use((req, res, next) => {
  req.cloudinaryConnected = cloudinaryConnected;
  next();
});

app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/hospital", hospitalRouter)

app.get("/", (req, res) => {
  res.send("API Working")
});

app.listen(port, () => console.log(`Server started on PORT:${port}`))