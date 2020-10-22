
export const DISPOSE = Symbol("dispose")

export function dispose<T extends object>(object: T) {
    for (const property of Object.values(object)) {
        if (typeof property == "object" && property != null && DISPOSE in property) {
            property[DISPOSE]()
        }
    }
}

export interface IDisposable {
    [DISPOSE](): void
}


export class Disposable implements IDisposable {
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