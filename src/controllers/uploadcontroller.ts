import {Request,Response} from "express";
import File from "../models/File";
import { v4 as uuidv4 } from "uuid";

export const uploadFile = async(req:Request,res:Response)=>{
 try{
  const file = req.file;

  if(!file) return res.status(400).json({error:"No file uploaded"});

  const newFile = await File.create({
   originalName:file.originalname,
   fileName:file.filename,
   size:file.size,
   mimeType:file.mimetype,
   shareId:uuidv4()
  });

  res.json({
   message:"File uploaded",
   link:`/api/download/${newFile.shareId}`
  });

 }catch(err){
  res.status(500).json({error:"Upload failed"});
 }
};
