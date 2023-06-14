import { AUTO_DISPOSE, Disposable, DISPOSE, disposeObject, IDisposable } from "./Disposable"
import { EventListener, IEventListener } from "./EventListener"
import { IDProvider } from "./IDProvider"
import { WeakRef } from "./SharedRef"

class ScriptableWeakRef<T extends IDisposable> extends WeakRef<T> implements IDisposable {
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

type Listener<T, L extends IDisposable> = (event: T, self: L) => void

interface IEventListenerReference<T, L extends IDisposable> {
    listener: (Listener<T, L>)
    once: boolean,
    self: ScriptableWeakRef<L>
}

export class EventEmitter<T = void> extends Disposable {
    protected listeners = {} as Record<string, IEventListenerReference<T, any>>
    protected [AUTO_DISPOSE] = true

    add<D extends IEventListener>(object: D | null, listener: Listener<T, D>, once = false) {
        const id = IDProvider.getID()

        this.listeners[id] = {
            listener, once,
            self: new ScriptableWeakRef((object ?? (new EventListener() as IEventListener)).getWeakRef(), () => {
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
        }
    }

    emit(event: T) {
        for (let id of Object.keys(this.listeners)) {
            const listener = this.listeners[id]
            // Listener can be null, if it is removed during execution of another listener
            if (listener != null) {
                const once = listener.once
                const self = listener.self.tryGetValue()
                if (once && this.listeners[id] != null) this.remove(id)
                listener.listener(event, self)
            }
        }
    }

    promise(object: IEventListener | null) {
        return new Promise<T>(resolve => {
            this.add(object, resolve, true)
        })
    }

    [DISPOSE]() {
        for (const listener of Object.values(this.listeners)) {
            listener.self[DISPOSE]()
        }

        this.listeners = {}

        super[DISPOSE]()
    }
}

export class DebouncedEventEmitter<T> extends EventEmitter<T> {
    protected _timeout: ReturnType<typeof setTimeout> | null = null
    protected _nextEvent: T | null = null

    public [DISPOSE]() {
        super[DISPOSE]()
        if (this._timeout != null) clearTimeout(this._timeout)
    }

    public emit(event?: T): void {
        this._nextEvent = event!
        if (this._timeout == null) {
            this._timeout = setTimeout(() => {
                super.emit(this._nextEvent!)
                this._timeout = null
                this._nextEvent = null
            }, this.timeout)
        }
    }

    constructor(
        public readonly timeout: number
    ) { super() }
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

export class DisposeObserver<T extends IDisposable> extends ScriptableWeakRef<T> {
    public [AUTO_DISPOSE] = true

    public readonly onDispose = new EventEmitter<{ target: T | null }>()

    constructor(target: WeakRef<T>) {
        super(target, () => this.onDispose.emit({ target: target.tryGetValue() }))
    }
}
