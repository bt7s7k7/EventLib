
export const DISPOSE = Symbol("dispose")

export function dispose<T extends object>(object: T) {
    for (const property of Object.values(object)) {
        if (DISPOSE in property) {
            property[DISPOSE]()
        }
    }
}


export class Disposable {
    dispose() {
        this[DISPOSE]()
    }

    [DISPOSE]() {
        dispose(this)
    }

    static make() {
        return {
            [DISPOSE]() {
                dispose(this)
            }
        }
    }
}