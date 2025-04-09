import { AppDataSource } from "@databases/dbsports";
import Roles from "@entity/Roles";

const roleRepository=AppDataSource.getRepository(Roles);
class RoleService{
    static async getAllRoles(){
        return await roleRepository.find();
    }
}

export default RoleService;