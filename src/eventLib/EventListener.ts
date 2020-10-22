import { Disposable, IDisposable } from "./Disposable";
import { ShareRef, WeakRef } from "./SharedRef";

export const EVENT_LISTENER_REF = Symbol("eventListenerRef")

export interface IEventListener extends IDisposable {
    [EVENT_LISTENER_REF](): WeakRef<IEventListener>
}

export class EventListener extends Disposable implements IEventListener {
    public [EVENT_LISTENER_REF]() {
        return this.shared.makeWeak()
    }

    protected shared = new ShareRef(this)
}