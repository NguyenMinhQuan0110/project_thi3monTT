import ArticlesService from "@services/articles.service";
import CommentService from "@services/comment.service";
import {Request, Response} from "express";
class HomeController{
    static async index(req: Request, res: Response) {
        const latestArticle= await ArticlesService.getLatestArticle();
        const topViewedArticles = await ArticlesService.getTopViewedArticles(5); // Lấy 5 bài viết có lượt xem cao nhất
        // Lấy danh sách ID của latestArticle
        const latestArticleIds = latestArticle.map(article => article.id!);

        // Lấy 5 bài viết đầu tiên cho mục "Các tin khác"
        const otherArticles = await ArticlesService.getOtherArticles(latestArticleIds, 0, 1);

        // Đếm tổng số bài viết để kiểm tra xem có cần hiển thị nút "Show More" không
        const totalOtherArticles = await ArticlesService.countOtherArticles(latestArticleIds);
        res.render('index.ejs', {
            latestArticle,
            topViewedArticles,
            otherArticles,
            totalOtherArticles,
            latestArticleIds, // Thêm biến này vào đây
            session: req.session
        });
    }
    static async detail(req: Request, res: Response) {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).send("ID không hợp lệ");
        }

        const article = await ArticlesService.getArticleById(id);
        if (!article) {
            return res.status(404).send("Bài viết không tồn tại");
        }
        // Tăng lượt xem khi người dùng truy cập bài viết
        await ArticlesService.incrementViews(id);
        const commentts= await CommentService.getCommentByIdArticle(id);

        res.render('detail.ejs', { session: req.session, article, commentts});
    }
    static async searchArticles(req: Request, res: Response) {
        try {
            const keywords = req.query.keywords as string;
            if (!keywords) {
                return res.render('search.ejs', {
                    session: req.session,
                    articles: [],
                    totalArticles: 0,
                    keywords: '',
                    message: 'Vui lòng nhập từ khóa tìm kiếm.'
                });
            }

            const articles = await ArticlesService.searchArticles(keywords, 0, 1);
            const totalArticles = await ArticlesService.countSearchArticles(keywords);

            res.render('search.ejs', {
                session: req.session,
                articles: articles || [],
                totalArticles: totalArticles || 0,
                keywords: keywords
            }); 
        } catch (error) {
            console.error('Error in HomeController.searchArticles:', error);
            res.status(500).send('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    }
    // API mới: Lấy thêm bài viết cho "Show More"
    static async loadMoreArticles(req: Request, res: Response) {
        const skip = parseInt(req.query.skip as string, 10) || 0;
        const take = 1; // Số bài viết lấy mỗi lần

        // Lấy danh sách ID của latestArticle từ query (hoặc lấy lại từ DB nếu cần)
        const latestArticleIds = req.query.latestArticleIds ? (req.query.latestArticleIds as string).split(',').map(Number) : [];

        const otherArticles = await ArticlesService.getOtherArticles(latestArticleIds, skip, take);
        const totalOtherArticles = await ArticlesService.countOtherArticles(latestArticleIds);

        res.json({
            articles: otherArticles,
            hasMore: skip + take < totalOtherArticles // Kiểm tra xem còn bài viết để tải thêm không
        });
    }
    // API mới: Lấy thêm bài viết cho kết quả tìm kiếm
    static async loadMoreSearch(req: Request, res: Response) {
        try {
            const skip = parseInt(req.query.skip as string, 10) || 0;
            const take = 1;
            const keywords = req.query.keywords as string;

            if (!keywords) {
                return res.status(400).json({ error: 'Từ khóa tìm kiếm không được để trống.' });
            }

            const articles = await ArticlesService.searchArticles(keywords, skip, take);
            const totalArticles = await ArticlesService.countSearchArticles(keywords);

            res.json({
                articles: articles,
                hasMore: skip + take < totalArticles
            });
        } catch (error) {
            console.error('Error in HomeController.loadMoreSearch:', error);
            res.status(500).json({ error: 'Đã có lỗi xảy ra khi tải thêm bài viết.' });
        }
    }
    // Hàm mới: Hiển thị bài viết theo thể loại
    static async getArticlesByCategory(req: Request, res: Response) {
        try {
            const categoryId = parseInt(req.params.categoryId, 10);
            if (isNaN(categoryId)) {
                return res.status(400).send("ID thể loại không hợp lệ");
            }

            const category = await ArticlesService.getCategoryById(categoryId);
            if (!category) {
                return res.status(404).send("Thể loại không tồn tại");
            }

            const articles = await ArticlesService.getArticlesByCategory(categoryId, 0, 1);
            const totalArticles = await ArticlesService.countArticlesByCategory(categoryId);

            res.render('category.ejs', {
                session: req.session,
                articles: articles || [],
                totalArticles: totalArticles || 0,
                category: category,
                categoryId: categoryId
            });
        } catch (error) {
            console.error('Error in HomeController.getArticlesByCategory:', error);
            res.status(500).send('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    }

    // Hàm mới: Lấy thêm bài viết theo thể loại (Show More)
    static async loadMoreCategory(req: Request, res: Response) {
        try {
            const skip = parseInt(req.query.skip as string, 10) || 0;
            const take = 1;
            const categoryId = parseInt(req.query.categoryId as string, 10);

            if (isNaN(categoryId)) {
                return res.status(400).json({ error: 'ID thể loại không hợp lệ.' });
            }

            const articles = await ArticlesService.getArticlesByCategory(categoryId, skip, take);
            const totalArticles = await ArticlesService.countArticlesByCategory(categoryId);

            res.json({
                articles: articles,
                hasMore: skip + take < totalArticles
            });
        } catch (error) {
            console.error('Error in HomeController.loadMoreCategory:', error);
            res.status(500).json({ error: 'Đã có lỗi xảy ra khi tải thêm bài viết.' });
        }
    }

}
export default HomeController;