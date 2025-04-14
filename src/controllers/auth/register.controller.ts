import UsersService from "@services/user.service";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";

class Register {
    static showFormRegister(req: Request, res: Response) {
        res.render('auth/register.ejs', { error: null });
    }

    // Gửi OTP sau khi người dùng nhập thông tin đăng ký
    static async sendOTP(req: any, res: Response) {
        const { username, email, password, gender } = req.body;
        const avatar = req.file ? `${req.file.filename}` : '';

        try {
            // Lưu thông tin người dùng vào session để sử dụng sau khi xác thực OTP
            req.session.registrationData = { username, email, password, gender, avatar };

            // Gửi OTP
            await UsersService.sendOTP(email);

            // Chuyển hướng đến trang nhập OTP
            res.render('auth/verify-otp.ejs', { email, error: null });
        } catch (error: any) {
            console.log(error);
            res.render('auth/register.ejs', { error: error.message });
        }
    }

    // Xác thực OTP và hoàn tất đăng ký
    static async verifyOTP(req: any, res: Response) {
        const { email, otp } = req.body;

        try {
            // Kiểm tra OTP
            const isValidOTP = await UsersService.verifyOTP(email, otp);
            if (!isValidOTP) {
                throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn");
            }

            // Lấy thông tin từ session
            const registrationData = req.session.registrationData;
            if (!registrationData) {
                throw new Error("Dữ liệu đăng ký không tồn tại. Vui lòng đăng ký lại.");
            }

            const { username, password, gender, avatar } = registrationData;

            // Tạo tài khoản người dùng
            await UsersService.createUser(username, email, password, gender, avatar);

            // Xóa OTP và dữ liệu session
            await UsersService.deleteOTP(email);
            delete req.session.registrationData;

            // Lưu email vào cookie và chuyển hướng đến trang đăng nhập
            res.cookie('email', email, { maxAge: 900000, httpOnly: true });
            res.redirect("/login");
        } catch (error: any) {
            console.log(error);
            res.render('auth/verify-otp.ejs', { email, error: error.message });
        }
    }

    // Xử lý update profile
    static showFormUpdateProfile(req: any, res: Response) {
        res.render('auth/updateProfile.ejs', { user: req.session.userLogin });
    }

    // Xử lý cập nhật thông tin người dùng
    static async updateUser(req: any, res: Response) {
        const userId = req.session.userLogin.id;
        const { username, email, gender, password } = req.body;

        try {
            // Lấy thông tin user hiện tại từ database
            const user = await UsersService.getUserById(userId);
            if (!user) {
                throw new Error("Người dùng không tồn tại");
            }

            let avatar = user.avatar; // Giữ nguyên avatar cũ nếu không tải lên ảnh mới

            // Nếu có file mới được tải lên
            if (req.file) {
                // Xóa avatar cũ nếu tồn tại
                if (user.avatar) {
                    const oldAvatarPath = path.join(__dirname, "../../public/img/avatar", user.avatar);
                    if (fs.existsSync(oldAvatarPath)) {
                        fs.unlinkSync(oldAvatarPath); // Xóa file ảnh cũ
                    }
                }

                avatar = req.file.filename; // Cập nhật avatar mới
            }

            // Cập nhật thông tin người dùng
            const updatedUser = await UsersService.updateUser(userId, { username, email, gender, password, avatar });

            // Cập nhật session
            req.session.userLogin = updatedUser;

            res.redirect("/home");
        } catch (error) {
            console.log(error);
            res.redirect("/updateProfile");
        }
    }
    static async deleteAccount(req: any, res: Response) {
        const userId = req.session.userLogin?.id;

        try {
            if (!userId) throw new Error('Bạn cần đăng nhập để xóa tài khoản');

            await UsersService.deleteUser(userId);

            // Hủy session và chuyển về trang đăng nhập
            req.session.destroy((err:any) => {
                if (err) console.error('Error destroying session:', err);
                res.redirect('/login');
            });
        } catch (error:any) {
            console.log(error);
            res.render('auth/updateProfile', { 
                user: req.session.userLogin, 
                error: error.message || 'Không thể xóa tài khoản', 
                success: null 
            });
        }
    }
}

export default Register;