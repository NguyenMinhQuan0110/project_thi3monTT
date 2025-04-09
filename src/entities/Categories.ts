import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:"categories"})
class Categories{
    @PrimaryGeneratedColumn()
    id?:number;
    
    @Column()
    name?:string;
    
    
}

export default Categories;