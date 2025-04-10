import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "mail của bạn ", // Email của bạn
        pass: "thay mật khẩu ứng dụng mail của bạn", // Mật khẩu ứng dụng của email
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
// Hàm mới: Gửi email thông báo bài viết mới
export const sendNewArticleEmail = async (to: string, articleTitle: string, articleDescription: string, articleId: number) => {
    const articleLink = `http://localhost:3000/detail/${articleId}`; // Thay đổi URL theo domain của bạn
    const mailOptions = {
        from: `"SportNew" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `Bài viết mới: ${articleTitle}`,
        html: `
            <h2>Bài viết mới trên SportNew</h2>
            <p>Chào bạn,</p>
            <p>Chúng tôi vừa đăng một bài viết mới mà bạn có thể quan tâm:</p>
            <h3>${articleTitle}</h3>
            <p>${articleDescription}</p>
            <p>Đọc bài viết chi tiết tại đây: <a href="${articleLink}">${articleLink}</a></p>
            <p>Cảm ơn bạn đã theo dõi SportNew!</p>
            <p>Nếu bạn không muốn nhận thông báo này, vui lòng bỏ qua email này.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('New article email sent successfully to:', to);
    } catch (error: any) {
        console.error('Error sending new article email:', error.message, error.stack);
        throw new Error('Không thể gửi email thông báo bài viết mới. Vui lòng thử lại sau.');
    }
};