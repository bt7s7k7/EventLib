import { Disposable, DISPOSE, IDisposable } from "./Disposable"

export interface InternalSharedStore<T> {
    value: T | null,
    users: number,
    callbacks: Record<string, () => void>
}

export class ShareRef<T extends IDisposable> extends Disposable {
    public get value() {
        return this.store.value!
    }

    public copy(): ShareRef<T> {
        return ShareRef.fromStore(this.store)
    }

    public makeWeak() {
        return new WeakRef(this.store)
    }

    protected store: InternalSharedStore<T>

    constructor(source: T) {
        super()

        this.store = {
            value: source,
            users: 1,
            callbacks: {}
        }

        this[DISPOSE] = () => {
            this.store.users--

            if (this.store.users == 0) {
                Object.values(this.store.callbacks).forEach(v => v())

                this.store.callbacks = {}

                this.store.value![DISPOSE]()
                this.store.value = null
            }

            super[DISPOSE]()
        }
    }

    public static fromStore<T extends IDisposable>(store: InternalSharedStore<T>) {
        if (store.value == null) throw new DisposedReferenceError("Tried to create a SharedRef from a disposed store")
        const ret = new ShareRef<T>(store.value)
        store.users++
        ret.store = store
        return ret
    }
}

export class WeakRef<T extends IDisposable> {
    get value() {
        const value = this.store.value
        if (value == null) throw new DisposedReferenceError("Tried to deref a WeakRef with a disposed value")
        return value
    }

    get alive() {
        return this.store.value != null
    }

    tryGetValue() {
        return this.store.value
    }

    lock() {
        return ShareRef.fromStore(this.store)
    }

    constructor(protected readonly store: InternalSharedStore<T>) { }

    static empty = new WeakRef<any>({ callbacks: {}, users: 1, value: null })
}

export class DisposedReferenceError extends Error { }