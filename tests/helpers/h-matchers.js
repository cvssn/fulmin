if (typeof global === 'undefined') {
    global = window;
}

global.addToEqualMatchMatcher = function() {
    jasmine.addMatchers({
        // similar ao toequal com arrays, porém ignora
        // propriedades customizadas dos arrays
        toEqualMatch: function() {
            return {
                compare: function(actual, expected) {
                    var result = {};

                    if (Array.isArray(actual)) {
                        if (!Array.isArray(expected) || actual.length !== expected.length) {
                            result.pass = false;
                        } else {
                            for (var i = 0; i < actual.length; ++i) {
                                if (actual[i] !== expected[i]) {
                                    result.pass = false;
                                }
                            }

                            if (result.pass === undefined) {
                                result.pass = true;
                            }
                        }
                    } else {
                        result.pass = false;
                    }

                    return result;
                }
            };
        }
    });
};