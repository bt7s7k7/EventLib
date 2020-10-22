let id = 0

export const IDProvider = {
    next() {
        return (id++).toString()
    }
}