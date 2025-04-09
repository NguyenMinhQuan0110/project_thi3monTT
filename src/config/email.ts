import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "minhquan11003@gmail.com", // Email của bạn
        pass: "kmkq wjlw bgil bsep", // Mật khẩu ứng dụng của email
    },
});

export const sendOTPEmail = async (to: string, otp: string) => {
    const mailOptions = {
        from: `"SportNew" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Mã OTP xác thực đăng ký tài khoản',
        html: `
            <h2>Xác thực tài khoản SportNew</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại SportNew!</p>
            <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
            <p>Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully to:', to);
    } catch (error: any) {
        console.error('Error sending OTP email:', error.message, error.stack);
        throw new Error('Không thể gửi email OTP. Vui lòng thử lại sau.');
    }
};