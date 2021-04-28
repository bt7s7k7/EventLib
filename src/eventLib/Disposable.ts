
export const DISPOSE = Symbol("dispose")
export const AUTO_DISPOSE = Symbol("autoDispose")

export function disposeObject<T extends object>(object: T) {
    if (DISPOSE in object) {
        (object as { [DISPOSE]: any })[DISPOSE] = () => {
            throw new Error("Object was disposed already")
        }
    }

    for (const [key, property] of Object.entries(object)) {
        if (typeof property == "object" && property != null && property[AUTO_DISPOSE]) {
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