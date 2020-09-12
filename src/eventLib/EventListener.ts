import { Disposable, IDisposable } from "./Disposable";
import { IEventEmitter } from "./EventEmitter";

export interface IEventListener extends IDisposable {
    addEmitterRef<T>(emitter: IEventEmitter<T>): void
    removeEmitterRef<T>(emitter: IEventEmitter<T>): void
}

export class EventListener extends Disposable {
    protected refs = new Map<IEventEmitter<any>, number>();

    addEmitterRef<T>(emitter: IEventEmitter<T>) {
        if (!this.refs.has(emitter)) this.refs.set(emitter, 1)
        else this.refs.set(emitter, this.refs.get(emitter)! + 1)
    }

    removeEmitterRef<T>(emitter: IEventEmitter<T>) {
        if (this.refs.has(emitter)) {
            var value = this.refs.get(emitter)!
            if (value <= 1) {
                this.refs.delete(emitter)
            } else {
                this.refs.set(emitter, value - 1)
            }
        }
    }

    dispose() {
        super.dispose()
        this.refs.forEach((_, emitter) => emitter.disposeOf(this))
    }

    disposeOf(other: IEventEmitter<any>) {
        this.refs.delete(other)
    }
}