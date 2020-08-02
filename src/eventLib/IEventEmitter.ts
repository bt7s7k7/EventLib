import { IDisposable, makeDisposable } from "./IDisposable"

interface IEventListener<T, D> {
    listener: (event: T, object: D) => void
    once: boolean,
    object: IDisposable
}

export interface IEventEmitter<T> extends IDisposable {
    add<D extends IDisposable>(object: D, listener: IEventListener<T, D>["listener"], once?: boolean): string
    remove(id: string): void
    emit(event: T): void
    promise(object: IDisposable): Promise<T>

    [$$getListeners](): Record<string, IEventListener<T, any>>,
}

let globalId = 0
function getId() {
    return "event_" + globalId++
}

export const $$getListeners = Symbol("getListeners")

export function makeEventEmitter<T>() {
    let listeners = {} as Record<string, IEventListener<T, any>>
    return {
        ...makeDisposable(),
        add(object, listener, once = false) {
            let id = getId()
            listeners[id] = { listener, once, object }
            object.addDisposeAction(this, id, () => this.remove(id))

            return id
        },
        remove(id) {
            if (id in listeners) {
                const listener = listeners[id]
                listener.object.removeDisposeAction(this, id)
                delete listeners[id]
            } else throw new RangeError(`Event listener with id = "${id}" is not registered`)
        },
        emit(event) {
            for (let id of Object.keys(listeners)) {
                let once = listeners[id].once
                listeners[id].listener(event, listeners[id].object)
                if (once && listeners[id] != null) this.remove(id)
            }
        },
        [$$getListeners]: () => listeners,
        promise(object) {
            return new Promise<T>(resolve => {
                this.add(object, resolve, true)
            })
        }
    } as IEventEmitter<T>
}