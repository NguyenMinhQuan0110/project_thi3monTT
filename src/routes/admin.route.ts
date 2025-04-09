import indexAdmin from "@controllers/admin/index.controller";
import express,{ Router } from "express";
import { isAdmin } from '@middlewares/isAdmin';
import { checkAuth } from "@middlewares/checkAuth";
import indexArticles from "@controllers/admin/articles.controller";
import uploadArticleImage from '@middlewares/uploadArticleImage';
import validateCategory from '@middlewares/validateCategory';


const routerAdmin: Router=express.Router();

routerAdmin.get('/index',checkAuth,isAdmin,(req,res) => {
    indexAdmin.indexAdmin(req,res);
});
routerAdmin.post('/update-roles',checkAuth,isAdmin,(req,res) => {
    indexAdmin.updateUserRoles(req,res);
})
routerAdmin.get('/articles/index',checkAuth,isAdmin,(req,res) => {
    indexArticles.indexArticles(req,res);
})
routerAdmin.get('/articles/create',checkAuth,isAdmin,(req,res) => {
    indexArticles.showFormCreate(req,res);
})
routerAdmin.post('/articles/create',uploadArticleImage.array('images',5),checkAuth,isAdmin,validateCategory,(req,res)=>{
    indexArticles.createArticle(req,res);
})
routerAdmin.post('/articles/update',uploadArticleImage.array('images',5),checkAuth,isAdmin,(req,res)=>{
    indexArticles.updateArticle(req,res);
})
routerAdmin.post('/articles/delete/:id',checkAuth,isAdmin,(req,res)=>{
    indexArticles.deleteArticle(req,res);
})
export default routerAdmin;