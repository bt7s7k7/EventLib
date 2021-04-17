import { Disposable, DISPOSE, IDisposable } from "./Disposable"
import { ShareRef, WeakRef } from "./SharedRef"

export interface IEventListener extends IDisposable {
    getWeakRef(): WeakRef<IDisposable>
}

export class EventListener extends Disposable implements IEventListener {
    public getWeakRef() {
        return this.shared!.makeWeak()
    }

    [DISPOSE]() {
        this[DISPOSE] = () => { }
        // Call dispose on the SharedRef separately, because
        // the superclass DISPOSE sets the DISPOSE callback
        // to error, replacing our empty callback
        this.shared![DISPOSE]()
        this.shared = null
        super[DISPOSE]()
    }

    protected shared: ShareRef<this> | null = new ShareRef(this)

    constructor() {
        super()
    }
}