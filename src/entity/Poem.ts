import {Entity, BaseEntity, PrimaryGeneratedColumn, Column} from "typeorm";
import {UserPoem} from "@/types/userpoem.types";

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

    static fromUserPoem(userPoem: UserPoem): Poem {
        const poem = new Poem()

        poem.no = userPoem.id
        poem.title = userPoem.title
        poem.dynasty = userPoem.dynasty
        poem.author = userPoem.author
        poem.content = userPoem.content
        poem.favor = false

        return poem
    }

    toUserPoem(): UserPoem {
        return {
            id: this.no,
            title: this.title,
            dynasty: this.dynasty,
            author: this.author,
            content: this.content
        }
    }
}