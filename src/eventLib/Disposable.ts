export const $$getDisposeActions = Symbol("getDisposeActions")

export interface IDisposable {
    dispose(): void
    disposeOf(object: IDisposable): void
}

export const DISPOSE_OF_ACTION_ID = "_"

export class Disposable implements IDisposable {
    dispose() {
        Object.values(this).forEach(v => {
            if (typeof v == "object" && "dispose" in v) {
                v.dispose()
            }
        })
    }

    disposeOf(object: IDisposable) {

    }
}