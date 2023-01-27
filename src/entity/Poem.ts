import {Entity, BaseEntity, PrimaryGeneratedColumn, Column} from "typeorm";
@Entity('poem')
export class Poem extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    no!: number

    @Column("text")
    title!: string

    @Column("text")
    dynasty!: string

    @Column("text")
    author!: string

    @Column("text")
    content!: string

    @Column()
    favor!: boolean
}