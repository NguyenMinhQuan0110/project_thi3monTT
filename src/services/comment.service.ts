import { AppDataSource } from "@databases/dbsports";
import Comments from "@entity/Comments";

const commentRepository= AppDataSource.getRepository(Comments);
class CommentService{
    static async getCommentByIdArticle(articleId:number){
        const comments=await commentRepository.find({where:{article:{id:articleId}},relations: ["user"]});
        return comments;
    }
    static async getCommentById(commentId:number){
        const comment=await commentRepository.findOne({where:{id:commentId}});
        return comment;
    }
    static  async createComment(content: string, articleId: number, userId: number){
        const newComment=await commentRepository.create({
            content,
            article:{id:articleId},
            user:{id:userId}
        });
        return await commentRepository.save(newComment);
    }
    static async deleteComment(commentId: number){
         await commentRepository.delete({id:commentId});
    }
}

export default CommentService;