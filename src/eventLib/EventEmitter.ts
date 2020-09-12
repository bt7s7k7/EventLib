import { Disposable, IDisposable } from "./Disposable"
import { IEventListener } from "./EventListener"

interface IEventListenerReference<T, D> {
    listener: (event: T, self: D) => void
    once: boolean,
    listenerObject: IEventListener
}

export interface IEventEmitter<T> extends IDisposable {
    add<D extends IEventListener>(object: D, listener: IEventListenerReference<T, D>["listener"], once?: boolean): string
    remove(id: string): void
    emit(event: T): void
    promise(object: IEventListener): Promise<T>
}

let globalId = 0
function getId() {
    return "event_" + globalId++
}

export class EventEmitter<T> extends Disposable implements IEventEmitter<T> {
    protected listeners = {} as Record<string, IEventListenerReference<T, any>>
    protected listenerObjects = new Map<IEventListener, string[]>()

    add<D extends IEventListener>(object: D, listener: IEventListenerReference<T, D>["listener"], once = false) {
        let id = getId()
        this.listeners[id] = { listener, once, listenerObject: object }
        object.addEmitterRef(this)

        if (!this.listenerObjects.has(object)) this.listenerObjects.set(object, [])
        this.listenerObjects.get(object)!.push(id)

        return id
    }

    remove(id: string) {
        if (id in this.listeners) {
            const listener = this.listeners[id]
            listener.listenerObject.removeEmitterRef(this)
            var eventsArray = this.listenerObjects.get(listener.listenerObject)!
            eventsArray.splice(eventsArray.indexOf(id), 1)
            delete this.listeners[id]
        } else throw new RangeError(`Event listener with id = "${id}" is not registered`)
    }

    emit(event: T) {
        for (let id of Object.keys(this.listeners)) {
            let once = this.listeners[id].once
            this.listeners[id].listener(event, this.listeners[id].listenerObject)
            if (once && this.listeners[id] != null) this.remove(id)
        }
    }

    promise(object: IEventListener) {
        return new Promise<T>(resolve => {
            this.add(object, resolve, true)
        })
    }

    dispose() {
        this.listenerObjects.forEach((_, listenerObject) => {
            listenerObject.disposeOf(this)
        })

        this.listenerObjects.clear()
        this.listeners = {}
    }

    disposeOf(other: IEventListener) {
        if (this.listenerObjects.has(other)) {
            this.listenerObjects.get(other)!.forEach(v => delete this.listeners[v])
            this.listenerObjects.delete(other)
        }
    }
}