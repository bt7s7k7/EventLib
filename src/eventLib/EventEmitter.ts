import { AUTO_DISPOSE, Disposable, DISPOSE, IDisposable } from "./Disposable"
import { EventListener, IEventListener } from "./EventListener"
import { IDProvider } from "./IDProvider"
import { ScriptableWeakRef } from "./ScriptableWeakRef"
import { WeakRef } from "./SharedRef"

export type Listener<T, L extends IDisposable> = (event: T, self: L) => void

interface IEventListenerReference<T, L extends IDisposable> {
    listener: (Listener<T, L>)
    once: boolean,
    self: ScriptableWeakRef<L>
}

interface _EventEmitterOptions {
    /** Waits this timeout before calling listeners, only the latest event value is emitted @default false */
    debounceTimeout?: number
    /** Calls listeners on next microtask, only the latest event is emitted, use `deduplicate` to change @default false */
    async?: boolean
    /** If `async`, only emits the latest event @default true */
    deduplicate?: boolean
}

export class EventEmitter<T = void> extends Disposable {
    protected listeners = {} as Record<string, IEventListenerReference<T, any>>
    protected [AUTO_DISPOSE] = true
    protected _timeout: number | null
    protected _async: boolean
    protected _deduplicate: boolean
    protected _timeoutID: any = null
    protected _nextEvent: T | null = null

    add<D extends IEventListener>(object: D | null, listener: Listener<T, D>, options: boolean | { once?: boolean } = false) {
        const id = IDProvider.getID()
        object = object ?? (new EventListener() as unknown as D)
        const once = typeof options == "object" ? (options.once ?? false) : options

        this.listeners[id] = {
            listener, once,
            self: new ScriptableWeakRef(object!.getWeakRef(), () => {
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

    protected _emit(event: T) {
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

    emit(event: T) {
        if (this._timeout != null) {
            this._nextEvent = event!

            if (this._timeoutID == null) {
                this._timeoutID = setTimeout(() => {
                    this._timeoutID = null
                    const nextEvent = this._nextEvent!
                    this._nextEvent = null
                    this._emit(nextEvent)
                }, this._timeout)
            }
        } else if (this._async) {
            if (this._deduplicate) {
                this._nextEvent = event

                if (this._timeoutID == null) {
                    this._timeoutID = true
                    queueMicrotask(() => {
                        this._timeoutID = null
                        const nextEvent = this._nextEvent!
                        this._nextEvent = null
                        this._emit(nextEvent)
                    })
                }
            } else {
                queueMicrotask(() => this._emit(event))
            }
        } else {
            this._emit(event)
        }
    }

    promise(object: IEventListener | null, predicate?: (value: T) => boolean) {
        return new Promise<T>(resolve => {
            const handle = this.add(object, (value) => {
                if (predicate != null && !predicate(value)) return

                resolve(value)
                handle.remove()
            }, false)
        })
    }

    [DISPOSE]() {
        for (const listener of Object.values(this.listeners)) {
            listener.self[DISPOSE]()
        }

        this.listeners = {}

        super[DISPOSE]()
    }

    constructor(options?: _EventEmitterOptions) {
        super()

        this._timeout = options?.debounceTimeout ?? null
        this._async = options?.async ?? false
        this._deduplicate = options?.deduplicate ?? true
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

export class DisposeObserver<T extends IDisposable> extends ScriptableWeakRef<T> {
    public [AUTO_DISPOSE] = true

    public readonly onDispose = new EventEmitter<{ target: T | null }>()

    constructor(target: WeakRef<T>) {
        super(target, () => this.onDispose.emit({ target: target.tryGetValue() }))
    }
}
