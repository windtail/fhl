function ensureNonEmpty(s: string): string | undefined {
    if (s.length == 0) {
        return undefined
    } else {
        return s
    }
}

export class Search {
    keys?: string[]
    no?: number
    title?: string
    dynasty?: string
    author?: string

    static fromString(userSearch: string): Search {
        const search = new Search()

        const parts = userSearch.split(/\s+/)
        let keys: string[] = []

        for (const part of parts) {
            if (part.length == 0) {
                continue
            }

            if (part.startsWith('t')) {
                search.title = ensureNonEmpty(part.substring(1))
            } else if (part.startsWith('a')) {
                search.author = ensureNonEmpty(part.substring(1))
            } else if (part.startsWith('d')) {
                search.dynasty = ensureNonEmpty(part.substring(1))
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

    empty(): boolean {
        return !(this.keys || this.no || this.title || this.dynasty || this.author)
    }

    equals(other: Search): boolean {
        if (this.no !== other.no) {
            return false
        }
        if (this.title !== other.title) {
            return false
        }
        if (this.dynasty !== other.dynasty) {
            return false
        }
        if (this.author !== other.author) {
            return false
        }

        if (this.keys === undefined && other.keys === undefined) {
            return true
        } else if (this.keys !== undefined && other.keys !== undefined) {
            if (this.keys.length !== other.keys.length) {
                return false
            } else {
                const otherKeys = other.keys
                return this.keys.every((k, i) => (k === otherKeys[i]))
            }
        } else {
            return false
        }
    }
}
