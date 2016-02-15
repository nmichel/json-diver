window.onload = function() {
    var jjpet     = require('jjpet'),
        ast       = require('ast'),
        generator = require('generator')

    var ePattern = document.getElementById('pattern'),
        eDoc = document.getElementById('text_doc'),
        eCap = document.getElementById('text_cap'),
        eHtmlDoc = document.getElementById('html_doc'),
        eHtmlCap = document.getElementById('html_cap'),
        tm = null,
        json = null,
        jsonDecorated = null

    eHtmlCap.addEventListener('click', function(e) {
        var eSrc = e.srcElement,
            privId = eSrc.getAttribute('priv_id')
            
        while (! privId && (eSrc = eSrc.parentElement)) {
            privId = eSrc.getAttribute('priv_id')
        }
        if (! privId) {
            return // <== 
        }
        
        var privIdVal = parseInt(privId),
            eTgt = document.querySelector('#html_doc *[priv_id="'+privIdVal+'"]')
        
        var tgtList = document.querySelectorAll('*[priv_id]')
        for (var i = 0; i < tgtList.length; ++i) {
          tgtList[i].classList.remove('json-diver-active')
        }
        eTgt.classList.add('json-diver-active')
        eSrc.classList.add('json-diver-active')
        
        eTgt.scrollIntoView()
    })

    function build_on_click_handler(eTgt) {
        var eTgt = eTgt
        return function(e) {
            var tgtClassList = eTgt.classList,
                ctrClassList = e.srcElement.classList
            if (tgtClassList.contains('json-diver-hidden')) {
                tgtClassList.remove('json-diver-hidden')
                ctrClassList.remove('fa-plus-square-o')
                ctrClassList.add('fa-minus-square-o')
            }
            else {
                tgtClassList.add('json-diver-hidden')
                ctrClassList.add('fa-plus-square-o')
                ctrClassList.remove('remove-minus-square-o')
            }
        }
    }
    
    var build_json_tree = null
    
    var build_json_tree_object = function(v, eRoot) {
        eRoot.setAttribute('class', 'json-diver-object')

        var eContent = document.createElement('div')
        
        var eCtrl = document.createElement('i')
        eCtrl.setAttribute('class', 'fa fa-minus-square-o')
        eCtrl.addEventListener('click', build_on_click_handler(eContent))
        
        for (var k in v) {
            var ePair = document.createElement('div')
            ePair.setAttribute('class', 'json-diver-pair')
            
            var eKey = document.createElement('div')
            eKey.setAttribute('class', 'json-diver-key')
            eKey.innerHTML = k
            ePair.appendChild(eKey)
            
            var eValue = document.createElement('div')
            eValue.setAttribute('class', 'json-diver-value')
            
            build_json_tree(v[k], eValue)
            ePair.appendChild(eValue)
            
            eContent.appendChild(ePair)
        }
        
        eRoot.appendChild(eCtrl)
        eRoot.appendChild(eContent)
    }
    
    var build_json_tree_list = function(v, eRoot) {
        eRoot.setAttribute('class', 'json-diver-list')

        var eContent = document.createElement('div')
        
        var eCtrl = document.createElement('i')
        eCtrl.setAttribute('class', 'fa fa-minus-square-o')
        eCtrl.addEventListener('click', build_on_click_handler(eContent))
        eRoot.appendChild(eCtrl)
        
        for (var i = 0; i < v.length; ++i) {
            var ePair = document.createElement('div')
            ePair.setAttribute('class', 'json-diver-pair')
            
            var eKey = document.createElement('div')
            eKey.setAttribute('class', 'json-diver-key')
            eKey.innerHTML = '' + i
            ePair.appendChild(eKey)
            
            var eValue = document.createElement('div')
            eValue.setAttribute('class', 'json-diver-value')
            
            build_json_tree(v[i], eValue)
            ePair.appendChild(eValue)
            
            eContent.appendChild(ePair)
        }
        
        eRoot.appendChild(eCtrl)
        eRoot.appendChild(eContent)
    }

    build_json_tree = function(j, eRoot) {
        var eNode = document.createElement('div')
        eNode.setAttribute('priv_id', j.id__)

        var v = j.value__
        if (isObject(v)) {
            build_json_tree_object(v, eNode)
        } else if (isArray(v)) {
            build_json_tree_list(v, eNode)
        }
        else {
            var c = document.createElement('span'),
                cstr = '' + v
            if (typeof v === "string") {
                cstr = '"' + cstr + '"'
            }
            c.innerHTML = '' + cstr
            eNode.appendChild(c)
        }

        eRoot.appendChild(eNode)
    }

    function applypattern() {
        if (! jsonDecorated) {
            return // <== 
        }
        
        var p = ePattern.value 

        try {
            var ast = jjpet.parse(p),
                f = jjpet.generate(ast),
                fw = jjpet.generate(visitor.visit(ast, ast_decorator))

            var r = fw(jsonDecorated)

            eCap.value = JSON.stringify(f(json))

            eHtmlCap.innerHTML = ''
            for (var k in r.captures) {
                var pair = document.createElement('div'),
                    key = document.createElement('div'),
                    vals = document.createElement('div')
                key.innerHTML = k
                pair.appendChild(key)
                pair.appendChild(vals)
                var caps = r.captures[k]
                for (var i = 0; i < caps.length; ++i) {
                    build_json_tree(caps[i], vals)
                }
                eHtmlCap.appendChild(pair)
            }
        }
        catch (e) {
        }
    }

    function analyzeinput() {
        var p = ePattern.value 

        try {
            var ast = jjpet.parse(p)
            ePattern.classList.remove('json-diver-ko')
            ePattern.classList.add('json-diver-ok')
            applypattern()
        }
        catch (e) {
            ePattern.classList.add('json-diver-ko')
            ePattern.classList.remove('json-diver-ok')
        }
    }

    ePattern.addEventListener('input', function() {
        window.clearTimeout(tm)
        analyzeinput()
        // tm = window.setTimeout(analyzeinput, 300)
    })
    // ePattern.addEventListener('keydown', function(e) {
    //     if (e.keyCode == 13) {
    //         window.clearTimeout(tm)
    //         analyzeinput()
    //         applypattern()
    //     }
    // })

    function isObject(what) {
        return what != null && what instanceof Object && !(what instanceof Array)
    }

    function isArray(what) {
        return what != null && what instanceof Array
    }

    eDoc.addEventListener('input', function() {
        json = JSON.parse(eDoc.value)
        jsonDecorated = decorate_json(json)
        eHtmlDoc.innerHTML = ''
        build_json_tree(jsonDecorated, eHtmlDoc)
        
        applypattern()
    })

/*
    var t = jjpet.parse('{_:42}')
    var tw = visitor.visit(t, ast_decorator)
    var f = jjpet.generate(tw)
    var n = {id__: "1", value__: {a: { id__: "2", value__: 42}}}
    console.log(f(n))

    var fw = jjpet.generate(visitor.visit(jjpet.parse('[*, 42]'), ast_decorator))
    var nw = decorate_json([42])
    fw(nw)

    var fw = jjpet.generate(visitor.visit(jjpet.parse('[*, (?<c>_), 42]'), ast_decorator))
    var nw = decorate_json([1, "string", 42])
    fw(nw)

    var fw = jjpet.generate(visitor.visit(jjpet.parse('<{"k": (?<c>_)}>/g'), ast_decorator))
    var nw = decorate_json([1, {"notk": "foo"}, {"k": "bar"}, 42, {"a": "k", "k": "nice"}])
    fw(nw)

    var fw = jjpet.generate(visitor.visit(jjpet.parse('<!{"k": (?<c>_)}!>/g'), ast_decorator))
    var nw = decorate_json([1, {"notk": "foo"}, {"k": "bar"}, 42, {"a": "k", "k": "nice"}])
    fw(nw)
    var nw = decorate_json([1, {"notk": "foo"}, {"k": "bar"}, 42, {"a": "k", "k": "nice"}, [1, 2, {"notk": [3, 4, {"k": "deeeep"}, 5]}]])
    fw(nw)

    var fw = generator.generate(visitor.visit(jjpet.parse('<!(?<l>[*, 42])!>/g'), ast_decorator))
    var nw = decorate_json({"a": [1, 42], "b": [2, 42], "c": [{"c1": false}, {"c2": [3, 42]}, 42], "d": {}})
    fw(nw)
*/
}
