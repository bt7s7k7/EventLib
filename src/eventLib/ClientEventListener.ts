import { DISPOSE, IDisposable } from "./Disposable";
import { EventListener } from "./EventListener";

export class ClientEventListener extends EventListener {
    public guard(disposable: IDisposable) {
        this.guarding.push(disposable)
    }

    public [DISPOSE]() {
        super[DISPOSE]()

        this.guarding.forEach(v => v[DISPOSE]())
    }

    protected guarding: IDisposable[] = []
}