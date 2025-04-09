import UsersService from "@services/user.service";
import { Request,Response } from "express";
class Login{
    static showFormLogin(req: Request, res: Response){
        const {email,errorLogin}=req.cookies;
        res.render('auth/login.ejs',{'email':email,'errorLogin':errorLogin});
    }
    static async login(req: any, res: Response){
        const user: any= await UsersService.getAccoutByEmailPassword(req.body)
        console.log(user);
        if(user){
            //lưu lại sesion login
            req.session.regenerate(function(err:any){
                if(err){
                    console.log(err);
                    return;
                }
                req.session.userNameLogin=user.username;
                req.session.userLogin = user;
                req.session.roles = user.roles;
                req.session.save(function(err:any){
                    if(err){
                        console.log(err);
                        return;
                    }
                    res.redirect('/home');
                })
            })
        }else{
            res.cookie('errorLogin','Email or password incorrect',{maxAge:1000,httpOnly:true});
            res.redirect('/login');
        }
    }
    static logout(req: any, res: Response) {
        req.session.destroy((err: any) => {
            if (err) {
                console.log(err);
                return;
            }
            res.redirect('/login');
        });
    }
    

}

export default Login;