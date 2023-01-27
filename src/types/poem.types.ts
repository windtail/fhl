
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

  empty() : boolean {
    return !(this.keys || this.no || this.title || this.dynasty || this.author)
  }

}
