import mongoose,{Document} from "mongoose";

export interface IFile extends Document{
 originalName:string;
 fileName:string;
 size:number;
 mimeType:string;
 shareId:string;
 downloadCount:number;
}

const fileSchema = new mongoose.Schema<IFile>({
 originalName:String,
 fileName:String,
 size:Number,
 mimeType:String,
 shareId:String,
 downloadCount:{type:Number,default:0}
},{timestamps:true});

export default mongoose.model<IFile>("File",fileSchema);
