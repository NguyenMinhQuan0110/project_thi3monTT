import { NextFunction, Response, Request } from "express";


export const isAdmin = (req: any, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userLogin) {
        return res.redirect("/login"); // Nếu chưa đăng nhập, chuyển hướng đến trang login
    }

    const user = req.session.userLogin;

    // Kiểm tra nếu user có quyền admin (Role ID = 1)
    if (user.roles && user.roles.some((role: any) => role.id === 1|| role.id ===3)) {
        return next(); // Cho phép tiếp tục
    }

    // Nếu không phải admin, chuyển hướng về trang chủ
    return res.redirect("/home");
}