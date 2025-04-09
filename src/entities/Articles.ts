import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Categories from "./Categories";
import Users from "./Users";
import Images from "./Images";
import Comments from "./Comments";


@Entity({name:'articles'})
class Articles{
    @PrimaryGeneratedColumn()
    id?:number

    @Column()
    title?:string;
    
    @Column({ type: "text" })
    description?:string;
    
    @Column({ type: "longtext" })
    content?:string;
    
    @Column()
    createdAt?:Date;
    
    @Column({ default: 0 }) // Thêm trường views, mặc định là 0
    views?: number;

    @ManyToMany(()=>Categories)
    @JoinTable()
    categories?: Categories[];

    @ManyToOne(()=>Users,(users)=> users.articles)
    users?:Users;

    @OneToMany(()=>Images,(images)=> images.articles)
    images?: Images[];

    @OneToMany(()=>Comments,(comments)=> comments.article)
    comments?:Comments[];
}

export default Articles;