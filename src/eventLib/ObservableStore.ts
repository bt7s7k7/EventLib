import { EventEmitter, Listener } from "./EventEmitter"
import { EventListener, IEventListener, implementEventListener } from "./EventListener"

type _EventEmitterOptions = ConstructorParameters<typeof EventEmitter>[0]
type _ComputeGetterArgs<T> = { [P in keyof T]: T[P] extends ObservableStore<infer U> ? U : never }
export class ObservableStore<T> extends EventEmitter<T> {
    public get value() { return this._value }
    public set value(v) { this.emit(v) }

    public emit(event?: T): void {
        if (arguments.length == 0) {
            super.emit(this._value)
        } else {
            this._value = event!
            super.emit(this._value)
        }
    }

    public update(transformer: (value: T) => T) {
        this.emit(transformer(this._value))
    }

    /** Immediately executes the listener with the stores value and adds it as a event handler. */
    public watch<D extends IEventListener>(object: D | null, listener: Listener<T, D>): EventEmitter.ListenerHandle {
        object = object ?? (new EventListener() as unknown as D)

        const handle = this.add(object, listener)
        listener(this._value, object)
        return handle
    }

    constructor(
        protected _value: T,
        options?: _EventEmitterOptions
    ) {
        super(options)
    }
}

export class ComputedStore<R> extends ObservableStore<R> {
    public getWeakRef = implementEventListener(this)
    protected readonly _compute

    public updateNow() {
        const value = this._compute()
        this.emit(value)
    }

    protected constructor(compute: () => R, options?: _EventEmitterOptions) {
        super(compute(), options)
        this._compute = compute
    }

    public static make<T extends readonly ObservableStore<any>[], R>(input: T, getter: (...args: _ComputeGetterArgs<T>) => R, options?: _EventEmitterOptions) {
        const compute = () => {
            const values = input.map(v => v.value) as any[]
            const result = (getter as unknown as (...args: any[]) => R)(...values)
            return result
        }
        const computed = new ComputedStore(compute, options)

        const updateNow = () => computed.updateNow()
        for (const observable of input) {
            observable.add(computed, updateNow)
        }

        return computed
    }
}

ComputedStore.make([new ObservableStore(0), new ObservableStore(false)] as const, (a, b) => {
    return a.toString() + b.toString()
})
