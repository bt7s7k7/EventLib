# EventLib [![Testing](https://github.com/bt7s7k7/EventLib/workflows/Testing/badge.svg)](https://github.com/bt7s7k7/EventLib/actions?query=workflow%3ATesting)
TypeScript library for events and disposable objects. Usable in Node.js and in the browser. 
````ts
class Button extends Disposable {
    onClick = new EventEmitter<ClickEvent>
}

const button = new Button()

button.onClick.add(new EventListener(), (event, clickListener) => {
    if (event.clientX > 20) {
        // By disposing the click listener, all references
        // in event emitters get destroyed and this won't
        // trigger again
        clickListener.dispose()
    }
})
````

## Install

This library is installable using [UCPeM](https://github.com/bt7s7k7/UCPeM)
```js
const eventLib = github("bt7s7k7/EventLib").res("eventLib")
```
