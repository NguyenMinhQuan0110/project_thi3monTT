import Login from "@controllers/auth/login.controller";
import Register from "@controllers/auth/register.controller";
import HomeController from "@controllers/home.controller";
import express, {Request, Response, Router } from "express";
import upload from "@middlewares/upload";
import { checkAuth } from "@middlewares/checkAuth";
import CommentController from "@controllers/comment.controller";
import ForgotPasswordController from "@controllers/auth/forgotPassword.controller";
import ArticlesService from "@services/articles.service";

const router: Router = express.Router();
router.get('/home',(req: Request, res: Response) => {
    HomeController.index(req, res);
});
// Thêm route mới cho API "Show More"
router.get("/load-more-articles",(req:Request,res:Response)=>{
    HomeController.loadMoreArticles(req,res);
})
router.get('/detail/:id',(req: Request, res: Response) => {
    HomeController.detail(req, res);
})
router.post("/detail/insertcomment",checkAuth,(req: Request, res: Response) => {
    CommentController.creatComment(req, res);
})
router.get("/detail/deletecomment/:id",checkAuth,(req: Request,res:Response)=>{
    CommentController.deleteComment(req, res);
})
router.get('/login',(req: Request, res: Response) => {
    Login.showFormLogin(req, res);
});
router.post('/login',(req: Request,res: Response) =>{
    Login.login(req, res);
})
router.get('/logout',(req: Request,res: Response) =>{
    Login.logout(req, res);
})
router.get('/register',(req: Request,res: Response) => {
    Register.showFormRegister(req, res);
})
router.post('/register', upload.single("avatar"), (req: Request, res: Response) => {
    Register.sendOTP(req, res); // Sửa từ registerUser thành sendOTP
});
router.post('/verify-otp', (req: Request, res: Response) => {
    Register.verifyOTP(req, res);
});
router.get('/update-profile',checkAuth,(req: Request,res:Response)=>{
    Register.showFormUpdateProfile(req, res);
})

router.post('/update-profile',upload.single("avatar"),(req: Request,res: Response)=>{
    Register.updateUser(req, res);
})
// Thêm route cho chức năng quên mật khẩu
router.get('/forgot-password', (req: Request, res: Response) => {
    ForgotPasswordController.showForgotPasswordForm(req, res);
});

router.post('/forgot-password', (req: Request, res: Response) => {
    ForgotPasswordController.sendResetPasswordOTP(req, res);
});

router.post('/reset-password', (req: Request, res: Response) => {
    ForgotPasswordController.resetPassword(req, res);
});
router.get('/search', (req: Request, res: Response) => {
    HomeController.searchArticles(req, res);
});
// Thêm route mới cho API "Show More" của tìm kiếm
router.get("/load-more-search", (req: Request, res: Response) => {
    HomeController.loadMoreSearch(req, res);
});
// Thêm route mới để hiển thị bài viết theo thể loại
router.get('/category/:categoryId', (req: Request, res: Response) => {
    HomeController.getArticlesByCategory(req, res);
});

// Thêm route mới cho API "Show More" của bài viết theo thể loại
router.get("/load-more-category", (req: Request, res: Response) => {
    HomeController.loadMoreCategory(req, res);
});
router.get('/external-news', async (req, res) => {
    try {
      const externalNews = await ArticlesService.fetchExternalSportsNews();
      res.render('external-news', { externalNews, session: req.session });
    } catch (error) {
      res.render('external-news', { error: 'Không thể tải tin tức bên ngoài', externalNews: [] });
    }
  });
export default router; 