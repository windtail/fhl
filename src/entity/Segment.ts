import {Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, Relation} from "typeorm";
import {Poem} from "@/entity/Poem";

@Entity('segment')
export class Segment extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number

    @Column("text")
    content!: string

    @ManyToOne(() => Poem, (poem) => poem.segments, {
        nullable: false
    })
    poem!: Relation<Poem>
}
