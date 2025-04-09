
import RoleService from "@services/role.service";
import UsersService from "@services/user.service";
import { Request,Response } from "express";
class indexAdmin{
    static async indexAdmin(req:Request,res:Response){
        const users = await UsersService.getAllUsers();
        const roles = await RoleService.getAllRoles();
        res.render('admin/indexAdmin.ejs',{users,roles,session: req.session});
    }
    static async updateUserRoles(req:Request,res:Response){
        const {userId,roleIds}= req.body;
        await UsersService.updateUserRoles(userId,roleIds);
        res.redirect('/admin/index')
    }
}

export default indexAdmin;