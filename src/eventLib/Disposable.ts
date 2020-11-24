
export const DISPOSE = Symbol("dispose")

export function disposeObject<T extends object>(object: T) {
    if (DISPOSE in object) {
        (object as { [DISPOSE]: any })[DISPOSE] = () => {
            throw new Error("Object was disposed already")
        }
    }

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
    public dispose() {
        this[DISPOSE]()
    }

    [DISPOSE]() {
        disposeObject(this)
    }
}