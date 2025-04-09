import CommentService from "@services/comment.service";
import {Request, Response} from "express";
class CommentController{
    static async creatComment(req: any, res: Response){
        const { content, articleId } = req.body;
        const userId = req.session.userLogin.id;
        const newComment = await CommentService.createComment(content, articleId,userId);
        res.redirect(`/detail/${articleId}`);
    }
    static async deleteComment(req: any, res: Response){
        const commentId = Number(req.params.id);
        const articleId = req.query.articleId;
        const user = req.session.userLogin; // Lấy thông tin người dùng từ session

        // Lấy thông tin bình luận để kiểm tra tác giả
        const comment = await CommentService.getCommentById(commentId);
        if (!comment) {
            return res.status(404).send("Bình luận không tồn tại");
        }

        // Kiểm tra quyền: Admin (role.id = 1 hoặc 3) hoặc tác giả của bình luận
        const isAdmin = user.roles && user.roles.some((role: any) => role.id === 1 || role.id === 3);
        const isCommentOwner = comment.user?.id === user.id;

        if (!isAdmin && !isCommentOwner) {
            return res.status(403).send("Bạn không có quyền xóa bình luận này");
        }

        // Nếu có quyền, tiến hành xóa
        await CommentService.deleteComment(commentId);
        res.redirect(`/detail/${articleId}`);
    }
}

export default CommentController;