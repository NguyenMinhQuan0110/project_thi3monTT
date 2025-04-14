import ArticlesService from "@services/articles.service";
import { Request, Response } from "express";

class indexArticles{
    static async indexArticles(req: Request, res: Response){
        const articles= await ArticlesService.getAllArticles();
        const categories= await ArticlesService.getAllCategories();
        res.render('admin/articles/index.ejs',{articles,categories,session: req.session});
    } 
    static async showFormCreate(req: Request, res:Response){
        const categories= await ArticlesService.getAllCategories();
        res.render('admin/articles/create.ejs',{categories,session: req.session});
    }
    static async createArticle(req: any, res:Response){
        try {
            const { title, description, content, categories } = req.body;
            const userId = req.session.userLogin.id; 
            
            if(!categories){
                console.log('chọn danh mục cho bố');
                res.redirect('/admin/articles/create');
            }
            // Tạo bài viết mới
            const newArticle = await ArticlesService.createArticle(title, description, content, new Date(), userId);
            // Chuyển đổi danh mục thành mảng nếu chỉ chọn một danh mục
            const categoryArray = Array.isArray(categories) ? categories.map(Number) : [Number(categories)];
                
            // Gán thể loại (categories)
            await ArticlesService.updateCategory(newArticle.id as number, categoryArray);
        
            // Xử lý upload nhiều ảnh
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    await ArticlesService.insertImages(file.filename, newArticle.id as number);
                }
            }
            res.redirect("/admin/articles/index");
        } catch (error) {
            console.error(error);
        }
    }
    static async updateArticle(req:Request,res:Response){
        try {
            const { articleId,title, description, content, categories } = req.body;
            
            await ArticlesService.updateArticle(articleId, title, description, content);
            const categoryArray = Array.isArray(categories) ? categories.map(Number) : [Number(categories)];
            await ArticlesService.updateCategory(articleId, categoryArray);
            if(req.files && Array.isArray(req.files)){
                await ArticlesService.deleteImagesByArticle(articleId);
                for (const file of req.files) {
                    await ArticlesService.insertImages(file.filename, articleId);
                }
            }
            res.redirect("/admin/articles/index");

        } catch (error) {
            console.log(error);
        }
        
    }
    static async deleteArticle(req: Request, res: Response){
        const articleId = Number(req.params.id);
        if (!articleId) {
            return res.status(400).send("ID bài viết không hợp lệ");
        }

        await ArticlesService.deleteArticle(articleId);
        res.redirect("/admin/articles/index");
    }
}

export default indexArticles;