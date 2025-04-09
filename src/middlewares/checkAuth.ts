import { Response,NextFunction } from "express";


export const checkAuth=(req:any,res:Response,next:NextFunction) =>{
    const {userNameLogin }=req.session;
    console.log(userNameLogin,'middleware');
    if(userNameLogin){
       next();
    }else{
        res.redirect('/login');
    }
}