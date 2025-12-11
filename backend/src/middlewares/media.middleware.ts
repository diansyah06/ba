import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, 
    fieldSize: 10 * 1024 * 1024, 
  },
});

export default {
  single(fieldName: string) {
    return upload.single(fieldName);
  },
  multiple(fieldName: string) {
    return upload.array(fieldName);
  },
};