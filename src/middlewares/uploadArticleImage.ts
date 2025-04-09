import multer from "multer";
import path from "path";

// Cấu hình nơi lưu file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/public/img/articles");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file theo thời gian
    },
});

const upload = multer({ storage: storage });

export default upload;
