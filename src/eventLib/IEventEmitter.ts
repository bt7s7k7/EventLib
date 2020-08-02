import { IDisposable, makeDisposable } from "./IDisposable"

interface IEventListener<T> {
    listener: (event: T) => void
    once: boolean,
    object: IDisposable
}

export interface IEventEmitter<T> extends IDisposable {
    add(object: IDisposable, listener: IEventListener<T>["listener"], once?: boolean): string
    remove(id: string): void
    emit(event: T): void
    promise(object: IDisposable): Promise<T>

    [$$getListeners](): Record<string, IEventListener<T>>,
}

let globalId = 0
function getId() {
    return "event_" + globalId++
}

export const $$getListeners = Symbol("getListeners")

export function makeEventEmitter<T>() {
    let listeners = {} as Record<string, IEventListener<T>>
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
                listeners[id].listener(event)
                if (listeners[id].once) this.remove(id)
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