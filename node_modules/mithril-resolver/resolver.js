const m = require('./mithril')
const containsAllProps = (obj) => Object.keys(obj).reduce((a,name) => a && obj[name] instanceof Function && obj[name].name ==='prop', true)
const container = (component, queries = {}) =>
    (resolver) =>
        m.component({
            controller: function() {
                // run the controller on this controller,
                // then return that value
                // if the value is undefined, mithril passes `this`
                // to the `view()` as `ctrl`
                m.startComputation()
                let done = m.prop(false)
                resolver.resolve(queries).then(() => {
                    done(true)
                    m.endComputation()
                })
                component.controller.call(this)
                return done
            },
            view: function(done, args) {
                if(!done()) return null;

                return m.component(component, {...args, resolver, ...resolver.getState()})
            }
        })

let resolver  = (states = {}) => {
    let promises = []

    const _await = (_promises = []) => {
        promises = promises.concat(_promises)
        return Promise.all(promises)
    }

    const finish = () => {
        const total = promises.length
        return Promise.all(promises).then(values => {
            if(promises.length > total){
                return finish()
            }
            return values
        })
    }

    const resolve = (props) => {
        const keys = Object.keys(props)
        if (!keys.length) {
            return Promise.resolve(true)
        }

        let f = []
        keys.forEach((name) => {
            let p = m.prop(),
                x = props[name],
                fn = x instanceof Function && x()

            if(fn && fn.then instanceof Function){
                f.push(fn.then(p))
                states[name] = p
            }
        })

        return _await(f)
    }

    const getState = () => states

    return {
        finish,
        resolve,
        getState
    }
}

resolver.renderToString = (component, renderer, instance = resolver()) => {
    const t = component(instance)
    renderer(t)
    return instance.finish().then(() => {
        return renderer(t)
    })
}

resolver.render = (component, node, instance = resolver()) => {
    const t = component(instance)
    m.mount(node, t)
}

module.exports = {resolver, m, container}