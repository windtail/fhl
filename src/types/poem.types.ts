export interface Poem {
  id: number
  no: number
  title: string
  dynasty: string
  author: string
  content: string
  favor: boolean
}


export class Search {
  keys?: string[]
  no?: number
  title?: string
  dynasty?: string
  author?: string
  
  static fromString(userSearch: string) : Search {
    const search = new Search()

    const parts = userSearch.split(/\s+/)
    let keys: string[] = []

    for (const part of parts) {
      if (part.length == 0) {
        continue
      }

      if (part.startsWith('t')) {
        search.title = part.substring(1)
      } else if (part.startsWith('a')) {
        search.author = part.substring(1)
      } else if (part.startsWith('d')) {
        search.dynasty = part.substring(1)
      } else {
        const no = Number.parseInt(part)
        if (isNaN(no)) {
          keys = keys.concat(part)
        } else {
          search.no = no
        }
      }
    }

    if (keys.length > 0) {
      search.keys = keys
    }
    return search
  }

  match(poem: Poem) : boolean {
    if (this.no) {
      return poem.no == this.no
    } else {
      if (this.title) {
        if (!poem.title.includes(this.title)) {
          return false
        }
      }

      if (this.dynasty) {
        if (!poem.dynasty.includes(this.dynasty)) {
          return false
        }
      }

      if (this.author) {
        if (!poem.author.includes(this.author)) {
          return false
        }
      }

      if (this.keys) {
        for (const key in this.keys) {
          if (!poem.content.includes(key)) {
            return false
          }
        }
      }

      return true
    }
  }

  empty() : boolean {
    return !(this.keys || this.no || this.title || this.dynasty || this.author)
  }

}
