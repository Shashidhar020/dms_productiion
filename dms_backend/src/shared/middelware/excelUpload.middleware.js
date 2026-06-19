
import multer from "multer";
import path from "path";
import fs from "fs";
 
const uploadPath = "uploads/excel";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true});
}

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
  cb(null,`${Date.now()}-${file.originalname}`);
  }
 
});

const fileFilter = (req, file, cb) => {

  const allowedExtensions =  /xlsx|xls/;

  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.test(ext)) {  
    return cb(new Error("Required excel file"));
  }
   
  cb(null, true);

};

export const uploadExcel = multer({storage,fileFilter});
