import { AppDataSource } from "@databases/dbsports";
import Articles from "@entity/Articles";
import Categories from "@entity/Categories";
import Images from "@entity/Images";
import fs from 'fs';
import path from "path";
import { In, Like, Not } from "typeorm";
import UsersService from "./user.service";
import { sendNewArticleEmail } from "@config/email";
import axios from "axios";
import { google } from "googleapis";
const categoryRepository = AppDataSource.getRepository(Categories)
const articleRepository = AppDataSource.getRepository(Articles)
const imageRepository = AppDataSource.getRepository(Images)
// Khởi tạo YouTube API client
const youtube = google.youtube({
    version: 'v3',
    auth: 'Thay bằng API Key của bạn', // Thay bằng API Key của bạn
  });
class ArticlesService{
    static async getAllCategories(){
        return await categoryRepository.find();
    }
    static async getAllArticles(){
        const data= await articleRepository.find({relations:['users','categories','images']});
        return data;
    }
    static async createArticle(title:string,description:string,content:string,createdAt:Date,userId:number){
       const newArticle = articleRepository.create({
        title,
        description,
        content,
        createdAt:new Date,
        users:{id:userId},
        views: 0 // Khởi tạo views = 0 khi tạo bài viết mới
       });
       const savedArticle = await articleRepository.save(newArticle);

        // Sau khi tạo bài viết thành công, gửi email thông báo cho tất cả người dùng
        try {
            const users = await UsersService.getAllUsers(); // Lấy danh sách tất cả người dùng
            for (const user of users) {
                if (user.email) {
                    await sendNewArticleEmail(user.email, savedArticle.title!, savedArticle.description!, savedArticle.id!);
                }
            }
        } catch (error: any) {
            console.error('Error sending new article notification emails:', error.message);
            // Không throw error để không làm gián đoạn quá trình tạo bài viết
        }

        return savedArticle;
    }
    static async updateCategory(articleId:number,categorieId:number[]){
        const article = await articleRepository.findOne({ where: { id: articleId } });
        if (!article) {
            throw new Error("Bài viết không tồn tại");
        }
        const categories=await categoryRepository.findByIds(categorieId);
        if(!categories){
             throw new Error("Thể loại không tồn tại");
        }
        article.categories=categories;
        await articleRepository.save(article);
    }
    static async insertImages(path: string,articleId:number){
        const newImage= imageRepository.create({
            path,
            articles:{id:articleId}
        });
        return await imageRepository.save(newImage);
    }
    
    // Hàm xóa bài viết và dữ liệu liên quan
    static async deleteArticle(articleId: number) {
        const article = await articleRepository.findOne({ 
            where: { id: articleId }, 
            relations: ['images', 'categories'] 
        });

        if (!article) {
            throw new Error("Bài viết không tồn tại");
        }

        // Xóa file ảnh trong thư mục `public/img/`
        if (article.images && article.images.length > 0) {
            for (const image of article.images) {
                const imagePath = path.join(__dirname, "../../src/public/img/articles", image.path!);
                console.log("Đường dẫn file cần xóa:", imagePath);

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log("Đã xóa:", imagePath);
                }else{
                    console.log("Không tìm thấy:", imagePath);
                }
            }
        }

        // Xóa dữ liệu hình ảnh liên quan
        await imageRepository.delete({ articles: { id: articleId } });

        // Xóa liên kết giữa bài viết và danh mục (nếu có)
        article.categories = [];
        await articleRepository.save(article);

        // Xóa bài viết
        await articleRepository.delete(articleId);
    }
    static async updateArticle(articleId:number, title:string, description:string,content:string){
        const article= await articleRepository.findOne({where: {id: articleId}})
        if (!article) {
            throw new Error("Bài viết không tồn tại");
        }
        article.title=title;
        article.description=description;
        article.content=content;
        await articleRepository.save(article);
    }
    static async deleteImagesByArticle(articleId:number){
        const article = await articleRepository.findOne({ where: { id: articleId },relations:['images']});
        if (!article) {
            throw new Error("Bài viết không tồn tại");
        }
        if (article.images && article.images.length > 0) {
            for (const image of article.images) {
                const imagePath = path.join(__dirname, "../../src/public/img/articles", image.path!);
                console.log("Đường dẫn file cần xóa:", imagePath);

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log("Đã xóa:", imagePath);
                }else{
                    console.log("Không tìm thấy:", imagePath);
                }
            }
        }

        // Xóa dữ liệu hình ảnh liên quan
        await imageRepository.delete({ articles: { id: articleId } });
    }
    static async getLatestArticle(){
        return await articleRepository.find({relations: ['users','categories','images'], order: { createdAt: 'DESC' },take:6});
    }
    static async getArticleById(id:number){
        const article = await articleRepository.findOne({ where: { id: id }, relations: ['users','categories','images'] });

        return article;

    }
    static async searchArticles(keyword: string, skip: number = 0, take: number = 1) {
        return await articleRepository.find({
            where: { title: Like(`%${keyword}%`) },
            relations: ['users', 'categories', 'images'],
            order: { createdAt: 'DESC' },
            skip: skip,
            take: take
        });
    }

    static async countSearchArticles(keyword: string) {
        return await articleRepository.count({
            where: { title: Like(`%${keyword}%`) }
        });
    }
    // Hàm mới: Tăng lượt xem khi người dùng truy cập bài viết
    static async incrementViews(articleId: number) {
        const article = await articleRepository.findOne({ where: { id: articleId } });
        if (!article) {
            throw new Error("Bài viết không tồn tại");
        }
        article.views = (article.views || 0) + 1;
        await articleRepository.save(article);
    }

    // Hàm mới: Lấy 5 bài viết có lượt xem cao nhất
    static async getTopViewedArticles(limit: number = 5) {
        return await articleRepository.find({
            relations: ['users', 'categories', 'images'],
            order: { views: 'DESC' },
            take: limit
        });
    }
    static async getOtherArticles(excludeIds: number[], skip: number = 0, take: number = 1) {
        return await articleRepository.find({
            where: { id: Not(In(excludeIds)) },
            relations: ['users', 'categories', 'images'],
            order: { createdAt: 'DESC' },
            skip: skip, // Bỏ qua số bài viết đã lấy
            take: take // Số bài viết cần lấy
        });
    }

    // Hàm mới: Đếm tổng số bài viết không nằm trong excludeIds
    static async countOtherArticles(excludeIds: number[]) {
        return await articleRepository.count({
            where: { id: Not(In(excludeIds)) }
        });
    }
    // Hàm mới: Lấy bài viết theo thể loại
    static async getArticlesByCategory(categoryId: number, skip: number = 0, take: number = 1) {
        return await articleRepository.find({
            where: { categories: { id: categoryId } },
            relations: ['users', 'categories', 'images'],
            order: { createdAt: 'DESC' },
            skip: skip,
            take: take
        });
    }
    // Hàm mới: Đếm tổng số bài viết theo thể loại
    static async countArticlesByCategory(categoryId: number) {
        return await articleRepository.count({
            where: { categories: { id: categoryId } }
        });
    }

    // Hàm mới: Lấy thông tin thể loại theo ID
    static async getCategoryById(categoryId: number) {
        return await categoryRepository.findOne({ where: { id: categoryId } });
    }
    static async fetchExternalSportsNews(): Promise<any[]> {
        try {
          const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
              q: 'sports', // Từ khóa tìm kiếm: thể thao
              apiKey: 'thay bằng api key của bạn', // Thay bằng API Key của bạn
              language: 'en', // Ngôn ngữ (có thể đổi thành 'vi' nếu muốn tiếng Việt)
              sortBy: 'publishedAt', // Sắp xếp theo ngày xuất bản
            },
          });
          return response.data.articles; // Trả về danh sách bài viết từ NewsAPI
        } catch (error) {
          console.error('Error fetching external news:', error);
          throw new Error('Không thể lấy tin tức từ nguồn bên ngoài');
        }
    } 
    // Thêm phương thức mới: Lấy video highlight từ YouTube
  static async getMatchHighlights(matchTitle: string): Promise<any[]> {
    try {
        const response = await youtube.search.list({
          part: ['snippet'],
          q: `${matchTitle} highlights`,
          maxResults: 3,
          type: ['video'],
          videoEmbeddable: 'true',
        });
        if (!response.data.items || !Array.isArray(response.data.items)) {
          return [];
        }
        return response.data.items.map(item => ({
          title: item.snippet?.title || 'Không có tiêu đề', // Nếu snippet undefined, dùng giá trị mặc định
          videoId: item.id?.videoId || '', // Nếu id hoặc videoId undefined, dùng chuỗi rỗng
          embedUrl: item.id?.videoId ? `https://www.youtube.com/embed/${item.id.videoId}` : '', // Kiểm tra videoId trước khi tạo URL
          thumbnail: item.snippet?.thumbnails?.default?.url || '/img/default-thumbnail.jpg', // Nếu thumbnails hoặc default undefined, dùng ảnh mặc định
        }));
      } catch (error) {
        console.error('Error fetching YouTube highlights:', error);
        throw new Error('Không thể lấy video highlight từ YouTube');
      }
  }  
}

export default ArticlesService;