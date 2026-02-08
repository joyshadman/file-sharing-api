import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fileRoutes from "./routes/fileRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI is not defined in environment variables");
  process.exit(1);
}

mongoose.connect(mongoUri)
.then(()=>console.log("Mongo Connected"))
.catch(err=>console.log(err));

app.use("/api",fileRoutes);

app.get("/",(_,res)=>{
 res.send("TS File Sharing Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
 console.log(`Server running on port ${PORT}`);
});

