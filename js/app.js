// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
// require("isomorphic-fetch")

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc
import * as u from 'universal-utils'
const {vdom:{mount, m, update, qs, rAF, debounce, container}, store:{store}, router:{router}, fetch:{fetch:_fetch}, csp:{channel}} = u

// Check for ServiceWorker support before trying to install it
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./serviceworker.js').then(() => {
        // Registration was successful
        console.info('registration success')
    }).catch(() => {
        console.error('registration failed')
            // Registration failed
    })

    const unregister = () => navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {registration.unregister()}
    })
    window.unregister = unregister
} else {
    // No ServiceWorker Support
}

// the following line, if uncommented, will enable browserify to push
// a changed file to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => {
        // app()
        update()
    })
}

let Babel = window.Babel
let presets = ['es2015', 'stage-0', 'react']

// import {container, resolver, m} from 'mithril-resolver'
import codemirror from 'codemirror'
import jsmode from 'codemirror/mode/javascript/javascript'
import comment from 'codemirror/addon/comment/comment'
import sublime from 'codemirror/keymap/sublime'

String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

const directions = `/* (1) code your JS as normal.
 * (2) parsing and operational errors will be displayed in a popover.
 * (3) CMD+S to share a link to your code.
 *
 * Other things to note: this tool compiles es7/6 (es2015/2016) into es5, sends it
 * to an iframe, and polyfills most missing functionality. Thus, for built-in AJAX,
 * you can use fetch(), and for built-in Promises you can use the es6 Promise() spec.
 *
 * What else works with Arbiter? ... Everything! Arbiter uses babel-core to transpile
 * JavaScript right here, in your browser. You can see the latest and
 * greatest Babel features at https://babeljs.io/docs/learn-es2015/.
 *
 * require() any package like so:
 *
 * --------
 * require('react', 'lodash').then() => // load multiple libs, too!
 *     let React = react
 *     // ... use React as normal
 * )
 *
 * or require any specific version with semver:
 * require('lodash@^3.0.1')
 * require('react@0.14.1')
 * --------
 *
 * Built with love by @matthiasak
 * - http://mkeas.org
 * - http://github.com/matthiasak
 * */`

let program = unescape(window.location.hash.slice(1)) || `${directions}

let canvas = document.createElement('canvas'),
    {body} = document,
    c = canvas.getContext('2d')

body.appendChild(canvas)

canvas.width = body.offsetWidth
canvas.height = body.offsetHeight

c.fillStyle = '#f449f0'
c.fillRect(0,0,500,400)

c.fillStyle = 'white'
c.fillRect(50,50,20,20)
`

function prepEnvironment() {
    // Disable Context Menu
    document.oncontextmenu = function() {
        return false
    }

    // Disable dragging of HTML elements
    document.ondragstart = function() {
        return false
    }
}
prepEnvironment()

const key = 'AIzaSyC70EBqy70L7fzc19pm_CBczzBxOK-JnhU'
const urlShortener = () => {
    googleShortener(window.location.toString())
}
const googleShortener = (longUrl) =>
    fetch(`https://www.googleapis.com/urlshortener/v1/url?key=${key}`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({longUrl})
        }
    ).then((r) => r.json()).then((data) => {
        window.prompt("Copy URL to clipboard:", data.id)
    })

/**
 * TRANSDUCER stuff
 */

// resources
const clone = (data) => typeof data === 'undefined' ? data : JSON.parse(JSON.stringify(data))
const concat = (arr, x) => arr.concat([x])
const compose = (f, g) => (x) => f(g(x))
const each = (c, cb) => c.forEach(cb)
const c = compose
const map = (c, transform) => c.map(transform)
const reduce = (c, reducer, initial) => c.reduce(reducer, initial)
const filter = (c, pred) => c.filter(pred)
const ident = (x) => x
const until = (c, pred, hasBeenReached = false) =>
    c.reduce((a, v) => {
        !hasBeenReached && !(hasBeenReached = pred(v)) && a.push(v)
        return a
    }, [])
const last = (c) => c[c.length > 1 ? c.length-1 : 0]
const head = (c) => c[0]
const rest = (c) => c.slice(1)
const find = (c, pred) => {
    for(var i = 0, len = c.length; i < len; i++) {
        let r = c[i]
        if(pred(r)) return r
    }
    return null
}
const concatAll = (cc) => [].concat(...cc)
const ignores = (c, ignore) => filter(c, (x) => ignore.indexOf(x) === -1)
const count = (a) => a.length

const prop = (val, onSet) => {
    return function(x){
        if(!arguments.length) return val
        val = x
        onSet instanceof Function && onSet(x, val)
        return val
    }
}

// const chan = () => {
//     const dests = new Set(),
//         pipe = (...args) => {
//             for(var x of dests) x(...args)
//         }

//     return {
//         from: cb => cb(pipe),
//         to: cb => dests.add(cb),
//         unto: cb => dests.remove(cb),
//         send: (...args) => pipe(...args)
//     }
// }

const channels = {
    codeEdited: channel(),
    logEmitted: channel(),
    codeCleared: channel(),
    errorOccurred: channel(),
    codeAnalyzed: channel()
}

const computable = fn => {
    return (...args) => {
        // m.startComputation()
        let val = fn(...args)
        update()
        // m.endComputation()
        return val
    }
}

const prefix_code = (code) => `
const _log = (arg) => {
    if(typeof arg === 'function') return arg+''
    if(arg instanceof Object) return JSON.stringify(arg)
    return arg
}

const range = (min, max) =>
    min + Math.round(Math.random() * (max-min))

const reset = () => window.parent.reset()

const each = (c, fn) => c.forEach(fn)

const assert = (test, message) => {
    if(!test) throw new Error('An assertion failed' + (message ? ' - '+message : ''))
}

// https://wzrd.in/standalone/semver
// https://npmcdn.com/semver

const __r = (semver, url='https://wzrd.in/standalone/') =>
    ((localStorage && (url+semver) in localStorage) ?
        new Promise((res,rej) => res(localStorage[url+semver])) :
        fetch(url+semver).then(x => x.text()).then(x => localStorage[url+semver] = x))
        .then(x => eval(x))
        .catch((e) => log(e+' --- '+url+semver))

const require = (...libs) =>
    Promise.all(libs.map(l =>
        __r(l)))

const clearAll = () =>
    Object.keys(localStorage).map(x =>
        localStorage.clear(x))

const log = (...args) => {
    let x = args.map(_log)
    each(x, i => {
        window.parent.addLog(i)
    })
}

${code}

`

const iframe_el = prop()

const analyze = program => {
    try{
        window.location.hash = `#${escape(program.trim())}`

        const result = Babel.transform(prefix_code(program), {presets}),
              {code} = result

        channels.codeAnalyzed.spawn(function*(put,take) {
            yield put(code)
        })

        channels.errorOccurred.spawn(function*(put,take) {
            yield put(false)
        })
    } catch(e){
        let {stackFrame, message} = e,
            x = {stackFrame, message}

        channels.codeCleared.spawn(function*(put,take) {
            put(true)
        })

        channels.errorOccurred.spawn(function*(put,take) {
            put(x)
        })
    }

}

const execCode = //debounce(
    transpiled => {
        codeframe.contentWindow.location.reload()
        channels.codeCleared.spawn(function*(put,take) {
            put(true)
        })
        codeframe.onload = () => {
            try {
                iframe_el().contentWindow.eval(transpiled)
            } catch(e) {
                let {stackFrame, message} = e,
                    x = {stackFrame, message}

                if(typeof e === 'string') x = {message: e}

                if(!x.stackFrame && !x.message){
                    let message = `Error thrown, however the value thrown is not handled as an instance of Error().`
                    x = {message}
                }

                channels.errorOccurred.spawn(function*(put,take) { put(x) })
            }
        }
    }
// , 250)

channels.codeEdited.spawn(function*(put,take) {
    while(true) {
        analyze(take()[1])
        yield
    }
})

channels.codeAnalyzed.spawn(function*(put,take) {
    while (true){
        let [status, transpiled] = take()
        transpiled && execCode(transpiled)
        yield
    }
})

const TwoPainz = () =>
    m('.grid.grid-2-800', Code, Results)

let editor = null
const edit = _ =>
    channels.codeEdited.spawn(function*(put,take) {
        put(editor.getValue())
    })

const Code = () => {
    const config = el => {
        editor = codemirror.fromTextArea(el, {
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 4,
            fixedGutter: true,
            mode: "javascript",
            keyMap: "sublime",
            extraKeys: {
                "Cmd-S": urlShortener,
                "Ctrl-S": urlShortener
            },
            // foldGutter: true,
            inputStyle: "textarea",
            autofocus: true,
            theme: 'material'
        })
        editor.on('change', edit)
        rAF(_ => edit)
    }

    return m('div', {shouldUpdate: () => 0}, m('textarea', {config}, program))
}

let state = {
    logs: [],
    error: ''
}

const addLog = window.addLog = (...m) =>
    channels.logEmitted.spawn(function*(put,take) {
        put(m)
    })

const reset = window.reset = () =>
    channels.codeCleared.spawn(function*(put,take) {
        put(true)
    })

let clear = computable(() => state.logs = []),
    log = computable((...m) => state.logs = [...state.logs, ...m]),
    err = computable(e => state.error = e || '')

channels.codeCleared.spawn(function*(put, take) {
    while(true){
        take()
        clear()
        yield
    }
})

channels.logEmitted.spawn(function*(put, take) {
    while(true){
        let [s, val] = take()
        val && log(...val)
        yield
    }
})

channels.errorOccurred.spawn(function*(put, take) {
    while(true){
        err(take()[1])
        yield
    }
})

const Results = () => {
    const iframe = el => iframe_el(el) && edit()

    const getError = () =>
        state.error &&
        `${state.error}\n---------\n${state.error.codeFrame || state.error.message}`

    return m('.right-pane',
            m('iframe#codeframe',
                {src: './worker.html', config: iframe, shouldUpdate: _ => false}),
            m(`textarea.errors${state.error ? '.active' : ''}`,
                {readonly:true, value: getError() }),
            m(`textarea.logs${state.logs.length ? '.active' : ''}`,
                {readonly:true, value: state.logs.join('\n') }))
}

const app = () => {
    mount(TwoPainz, qs('.container'))
}

app()

