import { DISPOSE, IDisposable } from "./Disposable";
import { EventListener } from "./EventListener";

export class ClientEventListener extends EventListener {
    public guard(disposable: IDisposable | (() => void)) {
        if (typeof disposable == "function") {
            this.guarding.push({ [DISPOSE]: disposable })
        } else {
            this.guarding.push(disposable)
        }
    }

    public [DISPOSE]() {
        super[DISPOSE]()

        this.guarding.forEach(v => v[DISPOSE]())
    }

    protected guarding: IDisposable[] = []
}