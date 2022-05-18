
export const DISPOSE = Symbol("dispose")
export const AUTO_DISPOSE = Symbol("autoDispose")

function doubleDisposeGuard() {
    throw new Error("Object was disposed already")
}

export function disposeObject<T extends object>(object: T) {
    if (DISPOSE in object) {
        (object as { [DISPOSE]: any })[DISPOSE] = doubleDisposeGuard
    }

    for (const [key, property] of Object.entries(object)) {
        if (typeof property == "object" && property != null && property[AUTO_DISPOSE]) {
            property[DISPOSE]()
        }
    }
}

export function isObjectDisposed(object: IDisposable) {
    return object[DISPOSE] == doubleDisposeGuard
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