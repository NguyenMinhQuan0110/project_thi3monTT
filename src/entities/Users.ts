
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Roles from "./Roles";
import Articles from "./Articles";
import Comments from "./Comments";

@Entity({name:'users'})
class Users{
    @PrimaryGeneratedColumn()
    id?:number

    @Column({unique: true})
    username?:string;

    @Column({unique: true})
    email?:string;

    @Column()
    password?:string;
    
    @Column()
    gender?:string;
    
    @Column()
    avatar?:string;
    @ManyToMany(()=>Roles)
    @JoinTable()
    roles?:Roles[]

    @OneToMany(()=>Articles,(articles)=>articles.users)
    articles?: Articles[]
    @OneToMany(()=>Comments,(comments)=>comments.user)
    comments?: Comments[]

}

export default Users;