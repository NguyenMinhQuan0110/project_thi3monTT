import { sendOTPEmail } from "@config/email";
import { AppDataSource } from "@databases/dbsports";
import Roles from "@entity/Roles";
import Users from "@entity/Users";
import OtpVerification from "@entity/OtpVerification"; // Thêm import
import bcrypt from 'bcrypt';
import path from "path";
import fs from "fs";
import Comments from "@entity/Comments";

const userRepository = AppDataSource.getRepository(Users);
const roleRepository = AppDataSource.getRepository(Roles);
const otpRepository = AppDataSource.getRepository(OtpVerification); // Thêm repository cho OtpVerification
const commentRepository = AppDataSource.getRepository(Comments);

class UsersService {
    static async getAllUsers() {
        return await userRepository.find({ relations: ['roles'] });
    }

    // Hàm tạo mã OTP ngẫu nhiên
    static generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString(); // Mã OTP 6 chữ số
    }

    // Lưu OTP vào bảng otp_verifications
    static async saveOTP(email: string, otp: string) {
        let otpRecord = await otpRepository.findOne({ where: { email } });
        if (otpRecord) {
            // Nếu đã có bản ghi, cập nhật OTP và thời gian hết hạn
            otpRecord.otp = otp;
            otpRecord.otp_expiry = new Date(Date.now() + 5 * 60 * 1000);
        } else {
            // Nếu chưa có, tạo bản ghi mới
            otpRecord = otpRepository.create({
                email,
                otp,
                otp_expiry: new Date(Date.now() + 5 * 60 * 1000),
            });
        }
        await otpRepository.save(otpRecord);
    }

    // Lấy OTP từ bảng otp_verifications
    static async getOTP(email: string): Promise<string | null> {
        const otpRecord = await otpRepository.findOne({ where: { email } });
        if (!otpRecord || !otpRecord.otp || !otpRecord.otp_expiry) return null;
        if (new Date() > otpRecord.otp_expiry) return null; // OTP hết hạn
        return otpRecord.otp;
    }

    // Xóa OTP sau khi xác thực thành công
    static async deleteOTP(email: string) {
        await otpRepository.delete({ email });
    }

    // Gửi OTP qua email
    static async sendOTP(email: string) {
        const otp = this.generateOTP();
        await UsersService.saveOTP(email, otp);
        await sendOTPEmail(email, otp);
        return otp;
    }

    // Xác thực OTP
    static async verifyOTP(email: string, otp: string): Promise<boolean> {
        const storedOTP = await this.getOTP(email);
        if (!storedOTP) {
            return false; // OTP không tồn tại hoặc đã hết hạn
        }
        return storedOTP === otp;
    }
    // Gửi OTP để đặt lại mật khẩu
    static async sendResetPasswordOTP(email: string) {
        const otp = this.generateOTP();
        await UsersService.saveOTP(email, otp);
        await sendOTPEmail(email, otp);
        return otp;
    }

    // Xác thực OTP để đặt lại mật khẩu
    static async verifyResetPasswordOTP(email: string, otp: string): Promise<boolean> {
        const storedOTP = await this.getOTP(email);
        if (!storedOTP) {
            return false; // OTP không tồn tại hoặc đã hết hạn
        }
        return storedOTP === otp;
    }

    // Xóa OTP sau khi đặt lại mật khẩu
    static async deleteResetPasswordOTP(email: string) {
        await otpRepository.delete({ email });
    }

    // Tìm người dùng theo email
    static async getUserByEmail(email: string) {
        return await userRepository.findOne({ where: { email } });
    }

    // Cập nhật mật khẩu theo email
    static async updateUserPasswordByEmail(email: string, newPassword: string) {
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            throw new Error("Người dùng không tồn tại");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await userRepository.save(user);
    }

    static async createUser(username: string, email: string, password: string, gender: string, avatar: string) {
        // Kiểm tra email/username tồn tại chưa
        const existingUser = await userRepository.findOne({ where: [{ username }, { email }] });
        if (existingUser) {
            throw new Error("User hoặc email đã tồn tại");
        }
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = userRepository.create({
            username,
            email,
            password: hashedPassword,
            gender,
            avatar,
        });

        return await userRepository.save(newUser);
    }

    static async getAccoutByEmailPassword(data: any): Promise<any> {
        const { email, password } = data;
        // Tìm người dùng theo email
        const user = await userRepository.findOne({ where: { email }, relations: ["roles"] });

        // Nếu không tìm thấy người dùng
        if (!user) {
            return null;
        }

        // So sánh mật khẩu nhập vào với mật khẩu đã băm trong database
        const isPasswordValid = await bcrypt.compare(password, user.password as string);

        if (!isPasswordValid) {
            return null; // Mật khẩu không đúng
        }

        return user; // Trả về thông tin người dùng nếu đúng
    }

    // Cập nhật thông tin người dùng
    static async updateUser(userId: number, updateData: any) {
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error("Người dùng không tồn tại");
        }

        // Kiểm tra xem có muốn đổi mật khẩu không
        if (updateData.password && updateData.password.trim() !== "") {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        } else {
            delete updateData.password; // Không thay đổi mật khẩu nếu không nhập mới
        }

        // Cập nhật thông tin
        Object.assign(user, updateData);
        return await userRepository.save(user);
    }

    static async getUserById(userId: number) {
        return await userRepository.findOne({ where: { id: userId } });
    }

    static async updateUserRoles(userId: number, roleIds: number[]) {
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error("Người dùng không tồn tại");
        }
        if (!roleIds) {
            user.roles = [];
        } else {
            const roles = await roleRepository.findByIds(roleIds);
            if (!roles) {
                throw new Error("Vai trò không tồn tại");
            }
            user.roles = roles;
        }
        return await userRepository.save(user);
    }
    static async deleteUser(userId: number) {
        try {
            const user = await userRepository.findOne({ 
                where: { id: userId },
                relations: ['articles', 'comments'] // Thêm 'comments'
            });
            if (!user) throw new Error('Người dùng không tồn tại');

            // Xóa ảnh đại diện nếu có
            if (user.avatar) {
                const avatarPath = path.join(__dirname, "../../src/public/img/avatar", user.avatar);
                if (fs.existsSync(avatarPath)) {
                    fs.unlinkSync(avatarPath);
                }
            }

            // Xóa tất cả bình luận của người dùng
            if (user.comments && user.comments.length > 0) {
                await commentRepository.delete({ user: { id: userId } });
            }

            // Xóa người dùng
            await userRepository.delete(userId);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Không thể xóa tài khoản');
        }
    }
}

export default UsersService;