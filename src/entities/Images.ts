import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Articles from "./Articles";

@Entity({name:'images'})
class Images{
    @PrimaryGeneratedColumn()
    id?:number;
    
    @Column()
    path?:string;

    @ManyToOne(()=>Articles,(articles)=>articles.images)
    articles?:Articles
}

export default Images;