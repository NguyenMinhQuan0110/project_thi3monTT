import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'roles'})
class Roles{
    @PrimaryGeneratedColumn()
    id?:number
    
    @Column()
    name?:string;

}

export default Roles;