require("babel/polyfill")
var Babel = require('babel-core')
import {container, resolver, m} from 'mithril-resolver'
let codemirror = require('codemirror')
let jsmode = require('codemirror/mode/javascript/javascript')
let comment = require('codemirror/addon/comment/comment')
let sublime = require('codemirror/keymap/sublime')

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
 * Built with love by @matthiasak
 * - http://mkeas.org
 * - http://github.com/matthiasak
 * */`
var program =
    unescape(window.location.hash.slice(1)) ||
`${directions}

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
    // Break out of frames

    // function bust() {
    //     document.write = "";
    //     window.top.location = window.self.location;
    //     setTimeout(function() {
    //         document.body.innerHTML = ''
    //     }, 0)
    //     window.self.onload = function(evt) {
    //         document.body.innerHTML = ''
    //     }
    // }

    // if (window.top !== window.self) {
    //     try {
    //         if (window.top.location.host) {} else {
    //             bust()
    //         }
    //     } catch (ex) {
    //         bust()
    //     }
    // }

    // Disable Context Menu
    document.oncontextmenu = function() {
        return false
    }

    // Disable dragging of HTML elements
    document.ondragstart = function() {
        return false
    }
}

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

const qs = (sel, el) => (el || document).querySelector(sel)

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

/**
 * @example
 *
    let channel = chan()
    const each = (arr, cb) => arr.forEach(cb)

    // in module A
    channel.from((_) => {
        window.addEventListener('mousemove', _ )
    })

    // in module B
    channel.to((...args) => {
        console.log(...args)
    })

    // in module C
    channel.send(1,2,3)
 *
 */


const prop = (val, onSet) => {
    if(val && onSet) onSet(val)
    return (x) => {
        if(!arguments.length) return val
        val = x
        onSet(x, val)
        return val
    }
}

const chan = () => {
    const dests = new Set(),
        pipe = (...args) => {
            for(var x of dests) x(...args)
        }

    return {
        from: cb => cb(pipe),
        to: cb => dests.add(cb),
        unto: cb => dests.remove(cb),
        send: (...args) => pipe(...args)
    }
}

const channels = {
    codeEdited: chan(),
    logEmitted: chan(),
    codeCleared: chan(),
    errorOccurred: chan(),
    codeAnalyzed: chan()
}

// let comps = 0
// const computable = fn => {
//     return (...args) => {
//         if(!comps) m.startComputation()
//         comps++
//         let val = fn(...args)
//         comps--
//         if(comps <= 0) m.endComputation()
//         return val
//     }
// }

// const computable = fn => {
//     return (...args) => {
//         let val = fn(...args)
//         m.redraw()
//         return val
//     }
// }

const computable = fn => {
    return (...args) => {
        m.startComputation()
        let val = fn(...args)
        m.endComputation()
        return val
    }
}

const prefix_code = (code) => `
const _log = (arg) => {
    if(typeof arg === 'function') return arg+''
    if(arg instanceof Object) return JSON.stringify(arg)
    return arg
}
const reset = () => window.parent.reset()
const each = (c, fn) => c.forEach(fn)
const log = (...args) => {
    let x = args.map(_log)
    each(x, i => {
        window.parent.addLog(i)
    })
}

${code}
`

const iframe_code = m.prop(''),
    iframe_el = m.prop()

const analyze = (program) => {
    try{
        const result = Babel.transform(prefix_code(program), {stage: 1}),
              {code} = result

        channels.codeAnalyzed.send(code)
        channels.errorOccurred.send()
    } catch(e){
        let {stackFrame, message} = e,
            x = {stackFrame, message}

        channels.codeCleared.send()
        channels.errorOccurred.send(x)
    }
    window.location.hash = `#${escape(program.trim())}`
}

channels.codeEdited.to(analyze)
channels.codeAnalyzed.to((code) => {
    iframe_code(code)
    m.redraw()
})

const frameLoaded = () => {
    iframe_el().contentWindow.requestAnimationFrame(() => {
        try {
            channels.codeCleared.send()
            iframe_el().contentWindow.eval(iframe_code())
        } catch(e) {
            let {stackFrame, message} = e,
                x = {stackFrame, message}

            if(typeof e === 'string') x = {message: e}

            if(!x.stackFrame && !x.message){
                let message = `Error thrown, however the value thrown is not handled as an instance of Error().`
                x = {message}
            }
            // console.log(e)
            channels.errorOccurred.send(x)
        }
    })
    // setTimeout(() => {

    // }, 0)
}
window.frameLoaded = frameLoaded

const TwoPainz = () => m('.grid.grid-2', {config: (e, init) => { if(init) return }}, Code(), Results())

const Code = () => {
    const config = (element, isInitialized, context, vdom) => {
        if(isInitialized) return
        context.editor = codemirror.fromTextArea(element, {
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
            inputStyle: "contenteditable",
            autofocus: false,
            theme: 'material'
        })
        context.editor.on('change', () => channels.codeEdited.send( context.editor.getValue() ))
        requestAnimationFrame(_ => channels.codeEdited.send(context.editor.getValue()) )
    }

    return m('div', m('textarea', {config}, program))
}

let state = {
    logs: [],
    error: ''
}

const addLog = (...m) => channels.logEmitted.send(...m)
window.addLog = addLog

const reset = () => channels.codeCleared.send()
window.reset = reset


const Results = () => {

    let clear = computable(() => state.logs = []),
        log = computable((...m) => state.logs = [...state.logs, ...m]),
        err = computable(e => state.error = e || '')

    const config = (el, init, context, vdom) => {
        if(init) return

        channels.codeCleared.to(clear)
        channels.logEmitted.to(log)
        channels.errorOccurred.to(err)

        context.onunload = () => {
            channels.codeCleared.unto(clear)
            channels.logEmitted.unto(log)
            channels.errorOccurred.unto(err)
        }
    }

    const iframe = (elem, init, context) => {
        if(init) return

        context.retain = true

        iframe_el(elem)
    }

    const getError = () => state.error && `${state.error}\n---------\n${state.error.codeFrame || state.error.message}`

    const view = () => m('.right-pane', {config},
        m('iframe', {src: './worker.html?hash='+(iframe_code().hashCode()), /*key: reloads,*/ onLoad:'frameLoaded();', config: iframe}),
        m('textarea', {readonly:true, value: getError(), className: `errors ${state.error ? 'active' : ''}` }),
        m('textarea', {readonly:true, value: state.logs.join('\n'), className: `logs ${state.logs.length ? 'active' : ''}` })
    )

    return {view}
}

window.onload = function(){
    prepEnvironment()
    m.mount(qs('.container'), {view: TwoPainz})
}
