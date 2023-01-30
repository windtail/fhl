import {Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, Relation} from "typeorm";
import {UserPoem} from "@/types/userpoem.types";
import {Segment} from "@/entity/Segment";

// TODO remove duplicate
function highlight(s: string, key: string): string {
    return s.replaceAll(key, `<span style="color: red">${key}</span>`)
}

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

    @OneToMany(() => Segment, (segment) => segment.poem, {
        cascade: true,
        onDelete: "CASCADE",
    })
    segments!: Relation<Segment[]>

    generateSegments() {
        this.segments = this.content
            .split(/\s*[,!?，。！？\n]/)
            .filter(seg => seg.length > 0)
            .map((seg) => {
                const segment = new Segment()
                segment.poem = this
                segment.content = seg
                return segment
            })
    }

    searchPreview!: string

    updateSearchPreview(keys: string[] | undefined) {
        if (keys && this.segments) {
            const matches: string[] = []

            for (const seg of this.segments) {
                for (const key of keys) {
                    if (seg.content.indexOf(key) >= 0) {
                        matches.push(seg.content)
                        break
                    }
                }
                if (matches.length >= 2) {
                    break
                }
            }

            for (const key of keys) {
                for (const [i, m] of matches.entries()) {
                    matches[i] = highlight(m, key)
                }
            }

            this.searchPreview = matches.join("，")
        } else {
            this.searchPreview = ""
        }
    }

    static fromUserPoem(userPoem: UserPoem): Poem {
        const poem = new Poem()

        poem.no = userPoem.id
        poem.title = userPoem.title
        poem.dynasty = userPoem.dynasty
        poem.author = userPoem.author
        poem.content = userPoem.content
        poem.favor = false
        poem.generateSegments()

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