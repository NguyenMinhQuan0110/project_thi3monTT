import { Request, Response, NextFunction } from "express";

const validateCategory = (req: Request, res: Response, next: NextFunction) => {
    const { categories } = req.body;

    // Kiểm tra nếu categories không tồn tại hoặc là một mảng rỗng
    if (!categories || (Array.isArray(categories) && categories.length === 0)) {
        return res.redirect("/admin/articles/create"); // Quay lại trang tạo bài viết
    }

    next(); // Tiếp tục xử lý nếu hợp lệ
};

export default validateCategory;
