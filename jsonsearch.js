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

    var build_cap_json_tree_object = function(v, eRoot) {
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
            build_json_tree_list(v[k], eValue)
            
            var eOuterValue = document.createElement('div')
            eOuterValue.setAttribute('class', 'json-diver-value')

            eOuterValue.appendChild(eValue)
            ePair.appendChild(eOuterValue)
            eContent.appendChild(ePair)
        }
        
        eRoot.appendChild(eCtrl)
        eRoot.appendChild(eContent)
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
            build_cap_json_tree_object(r.captures, eHtmlCap)
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

    function analyzeDoc() {
        json = JSON.parse(eDoc.value)
        jsonDecorated = decorate_json(json)
        eHtmlDoc.innerHTML = ''
        build_json_tree(jsonDecorated, eHtmlDoc)
    }

    eDoc.addEventListener('input', function() {
        analyzeDoc()
        applypattern()
    })

    analyzeDoc()
    analyzeinput()
}
