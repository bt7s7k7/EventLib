import { DISPOSE, disposeObject, IDisposable } from "./Disposable"
import { IDProvider } from "./IDProvider"
import { WeakRef } from "./SharedRef"


export class ScriptableWeakRef<T extends IDisposable> extends WeakRef<T> implements IDisposable {
    protected readonly id = IDProvider.getID()

    public [DISPOSE]() {
        delete this.store.callbacks[this.id]
        disposeObject(this)
    }

    constructor(source: WeakRef<T>, callback: () => void) {
        super((source as any).store)

        this.store.callbacks[this.id] = callback
    }
}
