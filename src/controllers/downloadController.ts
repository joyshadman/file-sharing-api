import {Request,Response} from "express";
import File from "../models/File";
import path from "path";

export const downloadFile = async(req:Request,res:Response)=>{
 const file = await File.findOne({shareId:req.params.id});

 if(!file) return res.status(404).send("File not found");

 file.downloadCount++;
 await file.save();

 res.download(path.resolve("src/uploads",file.fileName));
};
