window.onload = function() {
    var jjpet     = require('jjpet'),
        ast       = require('ast'),
        generator = require('generator')

    var ePattern = document.getElementById('pattern'),
        eDoc = document.getElementById('doc'),
        eCap = document.getElementById('cap'),
        tm = null

    function applypattern() {
        var p = ePattern.value 

        try {
            var ast = jjpet.parse(p),
                fw = jjpet.generate(visitor.visit(ast, ast_decorator))

            var j = JSON.parse(eDoc.value),
                jw = decorate_json(j)

            var r = fw(jw)
            
            eCap.value = JSON.stringify(r)
        }
        catch (e) {
        }
    }

    function analyzeinput() {
        var p = ePattern.value 

        try {
            var ast = jjpet.parse(p)
            ePattern.style.color = 'green'
        }
        catch (e) {
            ePattern.style.color = 'red'
        }
    }

    ePattern.addEventListener('input', function(e) {
        window.clearTimeout(tm)
        tm = window.setTimeout(analyzeinput, 300)
    })
    ePattern.addEventListener('keydown', function(e) {
        if (e.keyCode == 13) {
            window.clearTimeout(tm)
            analyzeinput()
            applypattern()
        }
    })

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

}
