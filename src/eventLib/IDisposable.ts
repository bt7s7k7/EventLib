
export interface IDisposable {
    dispose(): void
    addDisposeAction(object: IDisposable, id: string, action: () => void): void
    removeDisposeAction(object: IDisposable, id: string): void
    disposeOf(object: IDisposable): void
    [$$getDisposeActions](): Map<IDisposable, Record<string, () => void>>
}

export const $$getDisposeActions = Symbol("getDisposeActions")
export const DISPOSE_OF_ACTION_ID = "_"

export function makeDisposable(callback = () => { }) {
    const disposeActions = new Map<IDisposable, Record<string, () => void>>()

    return {
        dispose() {
            for (let [object, actions] of disposeActions.entries()) {
                object.disposeOf(this)
                for (let action of Object.values(actions)) {
                    action()
                }
            }
            disposeActions.clear()

            Object.values(this).forEach(v => {
                if ("dispose" in v) {
                    v.dispose()
                }
            })

            callback()
        },
        addDisposeAction(object, id, action) {
            if (!disposeActions.has(object)) disposeActions.set(object, {})
            disposeActions.get(object)![id] = action
            if (id != DISPOSE_OF_ACTION_ID) object.addDisposeAction(this, DISPOSE_OF_ACTION_ID, () => { })
        },
        removeDisposeAction(object, id) {
            if (!disposeActions.has(object)) return
            let objectActions = disposeActions.get(object)!
            delete objectActions[id]
            if (Object.values(objectActions).length == 0) {
                disposeActions.delete(object)
                object.disposeOf(this)
            }
        },
        disposeOf(object) {
            if (disposeActions.has(object)) {
                Object.values(disposeActions.get(object)!).forEach(v => v())
                disposeActions.delete(object)
            }
        },
        [$$getDisposeActions]: () => disposeActions
    } as IDisposable
}