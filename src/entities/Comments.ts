import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Articles from "./Articles";
import Users from "./Users";

@Entity({name:"comments"})
class Comments{
    @PrimaryGeneratedColumn()
    id?:number;
    @Column()
    content?:string;
    @ManyToOne(()=>Articles,(articles)=>articles.comments)
    article?: Articles;
    @ManyToOne(()=>Users,(users)=>users.comments)
    user?: Users;
}

export default Comments;