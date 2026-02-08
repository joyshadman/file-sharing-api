import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
 destination:"src/uploads",
 filename:(_,file,cb)=>{
  cb(null, uuidv4()+"-"+file.originalname);
 }
});

export default multer({storage});
