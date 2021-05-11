let id = 0

export namespace IDProvider {
    export function getID() {
        return (id++).toString()
    }
}