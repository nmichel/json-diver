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
        jsonDecorated = null,
        eComment = document.getElementById('comment'),
        history = [],
        counter = 10,
        eHistory = document.getElementById('history')

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
        try {
            json = JSON.parse(eDoc.value)
            jsonDecorated = decorate_json(json)
            eHtmlDoc.innerHTML = ''
            build_json_tree(jsonDecorated, eHtmlDoc)
            eDoc.classList.remove('json-diver-ko')
            eDoc.classList.add('json-diver-ok')
        }
        catch (e) {
            eDoc.classList.add('json-diver-ko')
            eDoc.classList.remove('json-diver-ok')
        }
    }

    eDoc.addEventListener('input', function() {
        analyzeDoc()
        applypattern()
    })

    function new_history_entry(counter, doc, pattern, comment) {
        return {
            id: counter,
            json: doc,
            pattern: pattern,
            comment: comment
        }
    }

    function push_in_history(entry) {
        history.push(entry)
        return counter++
    }

    function remove_from_history(id) {
        for (var i = 0; i < history.length; ++i) {
            var entry = history[i]
            if (id === entry.id) {
                history.splice(i,1)
                return // <== 
            }
        }
    }

    function find_in_history(id) {
        for (var i = 0; i < history.length; ++i) {
            var entry = history[i]
            if (id === entry.id) {
                return entry // <== 
            }
            
        }
        
        return null // <== 
    }

    function cb_load_history_entry(e) {
        var id = e.srcElement.getAttribute('hist_id'),
            entry = find_in_history(parseInt(id))

        eDoc.value = entry.json
        ePattern.value = entry.pattern
        eComment.value = entry.comment

        analyzeDoc()
        analyzeinput()
    }
    
    function cb_delete_history_entry(e) {
        var id = e.srcElement.getAttribute('hist_id'),
            histEntry = e.srcElement.parentElement

        remove_from_history(parseInt(id))
        histEntry.parentElement.removeChild(histEntry)
    }

    function build_history_entry(entry) {
        var id = entry.id,
            text = entry.comment,
            eHEntry = document.createElement('div'),
            eHEntryDel = document.createElement('div')

        eHEntryDel.classList.add('fa','fa-times')
        eHEntryDel.setAttribute('hist_id', ''+id)
        eHEntryDel.addEventListener('click', cb_delete_history_entry)

        eHEntry.classList.add('json-diver-hist-entry')
        eHEntry.setAttribute('hist_id', ''+id)
        eHEntry.textContent = text
        eHEntry.addEventListener('click', cb_load_history_entry)
        
        eHEntry.appendChild(eHEntryDel)
        return eHEntry
    }

    function add_history_entry(entry) {
        eHistory.insertBefore(build_history_entry(entry), eHistory.firstChild)
    }

    function cb_save_current_state() {
        var entry = new_history_entry(counter, eDoc.value, ePattern.value, eComment.value),
            eid = push_in_history(entry)
        add_history_entry(eid, eComment.value)
    }
    
    var eSave = document.getElementById('save')
    eSave.addEventListener('click', cb_save_current_state)

    /* Preset history
    */
    var preset = [
        {json: '["edit", "your", {"valid": true,\
                    "json": ["data", "here"]},\
                    "in", "real",\
                    ["time"]]', pattern: '<!(?<4letterswords>#"^[a-z]{4}$")!>/g', comment: 'Select all 4 letters strings in all document'},
        {json: '[{"neh": {"foo": true}},\
                 {"foo": "match1"},\
                 {"bar": "foo", "foo": ["match", "2"]},\
                 "foo",\
                 {"1": "a", "2": false, "foo": "match3"}]', pattern: '<{"foo": (?<val>_)}>/g', comment: 'Match and capture values of all (/g) objects with a "foo" key'},
        {json: '{"bar": 42, "foo": [1, 2]}', pattern: '{"foo": (?<val>_)}', comment: 'Match an object with a key "foo" an capture the value'},
        {json: '[1, 42]', pattern: '[_, 42]', comment: 'Match a 2 entries list endings with 42'}
    ]

    for (var i = 0; i < preset.length; ++i) {
        var e = preset[i],
            entry = new_history_entry(counter, e.json, e.pattern, e.comment)

        push_in_history(entry)
        add_history_entry(entry)
    }

    /* Analyze initial values 
    */
    analyzeDoc()
    analyzeinput()
}
