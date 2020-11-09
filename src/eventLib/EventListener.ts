import { Disposable, DISPOSE, IDisposable } from "./Disposable";
import { ShareRef, WeakRef } from "./SharedRef";

export const EVENT_LISTENER_REF = Symbol("eventListenerRef")

export interface IEventListener extends IDisposable {
    [EVENT_LISTENER_REF](): WeakRef<IDisposable>
}

export class EventListener extends Disposable implements IEventListener {
    public [EVENT_LISTENER_REF]() {
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

    protected shared: ShareRef<EventListener> | null = new ShareRef(this)

    constructor() {
        super()
    }
}