import { Disposable, DISPOSE, disposeObject, IDisposable } from "./Disposable";
import { EventListener, EVENT_LISTENER_REF } from "./EventListener";
import { IDProvider } from "./IDProvider";
import { WeakRef } from "./SharedRef";

class ScriptableWeakRef<T extends IDisposable> extends WeakRef<T> implements IDisposable {
    protected readonly id = IDProvider.next()

    public [DISPOSE]() {
        delete this.store.callbacks[this.id]
        disposeObject(this)
    }

    constructor(source: WeakRef<T>, callback: () => void) {
        super((source as any).store)

        this.store.callbacks[this.id] = callback
    }
}

type Listener<T, L extends IDisposable> = (event: T, self: L) => void;

interface IEventListenerReference<T, L extends IDisposable> {
    listener: (Listener<T, L>)
    once: boolean,
    self: ScriptableWeakRef<L>
}

export class EventEmitter<T> extends Disposable {
    protected listeners = {} as Record<string, IEventListenerReference<T, any>>

    add<D extends EventListener>(object: D | null, listener: Listener<T, D>, once = false) {
        const id = IDProvider.next()

        this.listeners[id] = {
            listener, once,
            self: new ScriptableWeakRef((object ?? new EventListener())[EVENT_LISTENER_REF](), () => {
                this.remove(id)
            })
        }

        return new EventEmitter.ListenerHandle(id, this)
    }

    remove(id: string) {
        if (id in this.listeners) {
            const listener = this.listeners[id]
            listener.self[DISPOSE]()
            delete this.listeners[id]
        } else throw new RangeError(`Event listener with id = "${id}" is not registered`)
    }

    emit(event: T) {
        for (let id of Object.keys(this.listeners)) {
            const once = this.listeners[id].once
            const self = this.listeners[id].self.tryGetValue()
            this.listeners[id].listener(event, self)
            if (once && this.listeners[id] != null) this.remove(id)
        }
    }

    promise(object: EventListener) {
        return new Promise<T>(resolve => {
            this.add(object, resolve, true)
        })
    }

    [DISPOSE]() {
        for (const listener of Object.values(this.listeners)) {
            listener.self[DISPOSE]()
        }

        super[DISPOSE]()
    }
}

export namespace EventEmitter {
    export class ListenerHandle {

        public remove() {
            this.eventEmitter.remove(this.id)
        }

        constructor(
            public readonly id: string,
            protected readonly eventEmitter: EventEmitter<any>
        ) { }
    }
}