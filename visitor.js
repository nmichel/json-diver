visitor = (function() {
    var ast = require('ast'),
        visitors = {}

    function visit(ast, backend) {
        return (visitors[ast.type] || visit_boom)(ast, backend)
    }

    function visit_number(ast, backend) {
        return backend.visit_number(ast.value)
    }
    
    function visit_string(ast, backend) {
        return backend.visit_string(ast.value)
    }
    
    function visit_regex(ast, backend) {
        return backend.visit_regex(ast.value)
    }
    
    function visit_boolean(ast, backend) {
        return backend.visit_boolean(ast.value)
    }
    
    function visit_null(ast, backend) {
        return backend.visit_null()
    }
    
    function visit_any(ast, backend) {
        return backend.visit_any()
    }
    
    function visit_object_any(ast, backend) {
        return backend.visit_object_any()
    }
    
    function visit_pair(ast, backend) {
        // The key must be preserved, as it is not a "regular" node
        return backend.visit_pair(ast.key, visit(ast.value, backend))
    }
    
    function visit_object(ast, backend) {
        var pms = ast.pairs.map(function(p) {
            return visit(p, backend)
        })
        return backend.visit_object(pms)
    }
    
    function visit_list_empty(ast, backend) {
        return backend.visit_list_empty()
    }
    
    function visit_list_any(ast, backend) {
        return backend.visit_list_any()
    }
    
    function visit_find_span(ast, backend) {
        return backend.visit_find_span(visit(ast.expr, backend))
    }
    
    function visit_item(ast, backend) {
        return backend.visit_item(visit(ast.expr, backend))
    }
    
    function visit_span(ast, backend) {
        var ims = ast.items.map(function(p) {
            return visit(p, backend)
        })
        return backend.visit_span(ims, ast.strict)
    }
    
    function visit_list(ast, backend) {
        var sms = ast.segments.map(function(p) {
            return visit(p, backend)
        })
        return backend.visit_list(sms)
    }
    
    function visit_iterable_any(ast, backend) {
        return backend.visit_iterable_any()
    }
    
    function visit_iterable(ast, backend) {
        var ims = ast.items.map(function(p) {
            return visit(p, backend)
        })
        return backend.visit_iterable(ims, ast.strict)
    }
    
    function visit_descendant(ast, backend) {
        var ims = ast.items.map(function(p) {
            return visit(p, backend)
        })
        return backend.visit_descendant(ims, ast.strict)
    }
    
    function visit_capture(ast, backend) {
        // Name must be preserved, as it is not a "regular" node
        return backend.visit_capture(ast.name, visit(ast.expr, backend))
    }
    
    function visit_inject(ast, backend) {
        // Name and typename must be preserved, as they are not "regular" nodes
        return backend.visit_inject(ast.name, ast.typename)
    }

    visitors[ast.NODE_KIND.NUMBER] =          visit_number
    visitors[ast.NODE_KIND.STRING] =          visit_string
    visitors[ast.NODE_KIND.REGEX] =           visit_regex
    visitors[ast.NODE_KIND.BOOLEAN] =         visit_boolean
    visitors[ast.NODE_KIND.NULL] =            visit_null
    visitors[ast.NODE_KIND.ANY] =             visit_any
    visitors[ast.NODE_KIND.OBJECT_ANY] =      visit_object_any
    visitors[ast.NODE_KIND.PAIR] =            visit_pair
    visitors[ast.NODE_KIND.OBJECT] =          visit_object
    visitors[ast.NODE_KIND.LIST_EMPTY] =      visit_list_empty
    visitors[ast.NODE_KIND.LIST_ANY] =        visit_list_any
    visitors[ast.NODE_KIND.FIND_SPAN] =       visit_find_span
    visitors[ast.NODE_KIND.ITEM] =            visit_item
    visitors[ast.NODE_KIND.SPAN] =            visit_span
    visitors[ast.NODE_KIND.LIST] =            visit_list
    visitors[ast.NODE_KIND.ITERABLE_ANY] =    visit_iterable_any
    visitors[ast.NODE_KIND.ITERABLE] =        visit_iterable
    visitors[ast.NODE_KIND.DESCENDANT] =      visit_descendant
    visitors[ast.NODE_KIND.CAPTURE] =         visit_capture
    visitors[ast.NODE_KIND.INJECT] =          visit_inject

    function visit_boom(ast, action) {
        throw "no visitor for node of type " + ast.type // <== 
    }

    return  {
        visit: visit
    }
})()

