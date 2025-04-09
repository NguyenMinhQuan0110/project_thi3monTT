import { Request, Response } from "express";
import UsersService from "@services/user.service";

class ForgotPasswordController {
    // Hiển thị form quên mật khẩu
    static showForgotPasswordForm(req: Request, res: Response) {
        res.render('auth/forgot-password.ejs', { error: null });
    }

    // Gửi OTP để đặt lại mật khẩu
    static async sendResetPasswordOTP(req: any, res: Response) {
        const { email } = req.body;

        try {
            // Kiểm tra xem email có tồn tại trong bảng users không
            const user = await UsersService.getUserByEmail(email);
            if (!user) {
                throw new Error("Email không tồn tại. Vui lòng kiểm tra lại.");
            }

            // Gửi OTP
            await UsersService.sendResetPasswordOTP(email);

            // Chuyển hướng đến trang nhập OTP để đặt lại mật khẩu
            res.render('auth/reset-password.ejs', { email, error: null });
        } catch (error: any) {
            console.log(error);
            res.render('auth/forgot-password.ejs', { error: error.message });
        }
    }

    // Xác thực OTP và đặt lại mật khẩu
    static async resetPassword(req: any, res: Response) {
        const { email, otp, newPassword, confirmPassword } = req.body;

        try {
            // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
            if (newPassword !== confirmPassword) {
                throw new Error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
            }

            // Kiểm tra OTP
            const isValidOTP = await UsersService.verifyResetPasswordOTP(email, otp);
            if (!isValidOTP) {
                throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn.");
            }

            // Cập nhật mật khẩu mới
            await UsersService.updateUserPasswordByEmail(email, newPassword);

            // Xóa OTP sau khi đặt lại mật khẩu thành công
            await UsersService.deleteResetPasswordOTP(email);

            // Chuyển hướng đến trang đăng nhập
            res.redirect("/login");
        } catch (error: any) {
            console.log(error);
            res.render('auth/reset-password.ejs', { email, error: error.message });
        }
    }
}

export default ForgotPasswordController;