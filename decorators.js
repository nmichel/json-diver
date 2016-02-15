ast_decorator = (function() {
    var ast = require('ast')
    
    function wrap_node(node) {
        var id = ast.build_matcher_pair(ast.build_matcher_string("id__"), ast.build_matcher_any()),
        value = ast.build_matcher_pair(ast.build_matcher_string("value__"), node)
        return ast.build_matcher_object([id, value])
    }

    return {
        visit_number: function(value) {
            return wrap_node(ast.build_matcher_number(value))
        },
        visit_string: function(value) {
            return wrap_node(ast.build_matcher_string(value))
        },
        visit_regex: function(value) {
            return wrap_node(ast.build_matcher_regex(value))
        },
        visit_boolean: function(value) {
            return wrap_node(ast.build_matcher_boolean(value))
        },
        visit_null: function() {
            return wrap_node(ast.build_matcher_null())
        },
        visit_any: function() {
            return wrap_node(ast.build_matcher_any())
        },
        visit_object_any: function() {
            return wrap_node(ast.build_matcher_object_any())
        },
        visit_pair: function(key, value) {
            return ast.build_matcher_pair(key, value)
        },
        visit_object: function(pairs) {
            return wrap_node(ast.build_matcher_object(pairs))
        },
        visit_list_empty: function() {
            return wrap_node(ast.build_matcher_list_empty())
        },
        visit_list_any: function() {
            return wrap_node(ast.build_matcher_list_any())
        },
        visit_find_span: function(span) {
            return ast.build_matcher_find_span(span)
        },
        visit_item: function(item) {
            return ast.build_matcher_item(item)
        },
        visit_span: function(items, strict) {
            return ast.build_matcher_span(items, strict)
        },
        visit_list: function(segments) {
            return wrap_node(ast.build_matcher_list(segments))
        },
        visit_iterable_any: function() {
            return wrap_node(ast.build_matcher_iterable_any())
        },
        visit_iterable: function(items, flag) {
            return wrap_node(ast.build_matcher_iterable(items, flag))
        },
        visit_descendant: function(items, flag) {
            return wrap_node(ast.build_matcher_descendant(items, flag))
        },
        visit_capture: function(name, expr) {
            return ast.build_matcher_capture(name, expr)
        },
        visit_inject: function(name, typename) {
            return ast.build_matcher_inject(name, typename)
        }
    }
})()

decorate_json = (function() {
    var counter = 1
    
    function get_node_id() {
        return "" + counter++
    }
    
    function isObject(what) {
        return what != null && what instanceof Object && !(what instanceof Array)
    }
    
    function isArray(what) {
        return what != null && what instanceof Array
    }

    return function(json) {
        if (isObject(json)) {
            var r = {}
            for (var k in json) {
                r[k] = decorate_json(json[k])
            }
            return { id__: get_node_id(), value__: r } // <== 
        }
        else if (isArray(json)) {
            var r = json.map(function(v) {
                return decorate_json(v)
            })
            return { id__: get_node_id(), value__: r } // <== 
        }
        else {
            return { id__: get_node_id(), value__: json } // <== 
        }
    }
})()
