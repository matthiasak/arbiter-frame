### Mithril-Resolver

---

![](https://david-dm.org/matthiasak/mithril-resolver.svg)

Using a slightly customized Mithril (using unmerged Pull Requests that [enable Mithril to bootstrap existing DOM nodes instead of completely redrawing HTML sent from the server](https://medium.com/@matthiasak/mithril-isomorphic-universal-experiment-cb645d1a9238)), I decided to try and create a [react-resolver-esque](https://github.com/ericclemmons/react-resolver/) library that allows the developer to create HOCs (Higher Order Components) that can lazy-load data before items are rendered to the page. 

This is not only a potential benfit to rendering performance (as it does not re-render on the client until all the Promises are resolved, thus rendering once), but it allows developers to write isomorphic/universal components that can be used on the server or the client.

These components, since they define the data they need for themselves, allows components to be almost "Plug n' Play". The developer no longer has to pass data down to the rendering/controllers of the app by some routing mechanism.

Repeating that argument in a better light: The route callbacks on client _or_ server do not need to be aware of what data is needed for that view, only which components are to be drawn!

> Note: Mithril-Resolver assumes you are using some kind of babel/browserify/webpack buildstep to transform ES6 into legacy-compatible ES5. You should also have a polyfill for native `Promise` objects in browser-side code.

---

### Example Mithril component

```js
let name = {
    controller: () => {
        return {name: m.prop('Matt')}
    },
    view: (ctrl, args) => m('div', [
        'hello world!',
        m('span', 'my name is'),
        m('bold', ctrl.name())
    ])
}
```

The above is a typical Mithril `component`. It is synchronous in nature, and here I am using a simple `m.prop()` to store my name.

In Mithril-Resolver, we wrap the component with a data source inside a container (`container(component, data)`):

```js
let data = {
    name: () => new Promise(res => 
            setTimeout(res.bind(null, 'matt'))
        , 3000)
}

let component = {
    controller: () => {
        return {}
    },
    view: (ctrl, args) => m('div', [
        'hello world!',
        m('span', 'my name is'),
        m('bold', args.name())
    ])
}

let name = container(component, data)
```

Things to note:

1. The `view()` in the `component` uses `args.name()` instead of `ctrl.name()`
2. Each entry in the `data` object is a function the returns a "thenable". In my case here, I am returning a native `Promise` object. [^1] 
3. The "prop" `args.name()` should give you the value that the `name` entry in `data` resolves to.

> Footnotes:
> 1. You can use `Promise`s in newer browsers and in Node, and there are polyfills for them to support legacy browsers. Check out Babel's polyfill, which involves the `corejs` library. The code in Mithril-Resolver expects support of native `Promise`.

### Rendering with Mithril-Resolver

Browser:

```js
import {resolver, container} from './resolver'
const qs = (sel, el) => (el || document).querySelector(sel)

resolver.render(name, qs('.container'))
```

Server (an Express `app`): 

```js
import {resolver, container} from './resolver'
import render from 'mithril-node-renderer'

const index = (html) => `
<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
    </head>
    <body>${html}</body>
</html>
`

app.get('name', (req, res) => {
    resolver.renderToString(name, render).then(html => res.send(index(html)))
})
```

### Example universal/isomorphic app

See http://github.com/matthiasak/wrinklefree-mithril

---

#### License

MIT.
