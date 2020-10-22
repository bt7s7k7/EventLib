import { Disposable, DISPOSE, IDisposable } from "./Disposable"

interface SharedStore<T> {
    value: T | null,
    users: number
}

export class ShareRef<T extends IDisposable> extends Disposable {
    public get value() {
        return this.store.value!
    }

    public copy(): ShareRef<T> {
        const ret = new ShareRef<T>(this.value)
        const store = this.store
        store.users++
        ret.store = store
        return ret
    }

    protected store: SharedStore<T>

    constructor(source: T) {
        super()

        this.store = {
            value: source,
            users: 1
        }

        this[DISPOSE] = () => {
            this.store.users--

            if (this.store.users == 0) {
                this.store.value![DISPOSE]()
                this.store.value = null
            }

            super[DISPOSE]()
        }
    }
}