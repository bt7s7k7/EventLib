import { Disposable, DISPOSE, IDisposable } from "./Disposable"
import { ShareRef, WeakRef } from "./SharedRef"

export interface IEventListener extends IDisposable {
    getWeakRef(): WeakRef<IDisposable>
}

export class EventListener extends Disposable implements IEventListener {
    public getWeakRef = implementEventListener(this)
}

export function implementEventListener<T extends IDisposable>(target: T) {
    let shared: ShareRef<T> | null = new ShareRef(target)

    const ret: () => WeakRef<T> = function () {
        return shared ? shared.makeWeak() : WeakRef.empty
    }

    const oldDispose = target[DISPOSE]
    target[DISPOSE] = function () {
        this[DISPOSE] = () => { }
        // Call dispose on the SharedRef separately, because
        // the superclass DISPOSE sets the DISPOSE callback
        // to error, replacing our empty callback
        shared![DISPOSE]()
        shared = null
        oldDispose.apply(this)
    }

    return ret
}