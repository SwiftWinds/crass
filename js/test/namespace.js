var assert = require("assert");

var crass = require('../crass');
var parseString = function(data) {
    return crass.parse(data).toString();
};


describe('@namespace', function() {
    it('should parse default @namespace blocks', function() {
        assert.equal(parseString('@namespace "namespace uri";'),
                     '@namespace "namespace uri";');
    });
    it('should parse default @namespace blocks with junk before the semicolon', function() {
        assert.equal(parseString('@namespace "namespace uri"    \t\n;'),
                     '@namespace "namespace uri";');
    });
    it('should parse multiple @namespace blocks', function() {
        assert.equal(parseString('@namespace "namespace uri"; @namespace foo "bar";'),
                     '@namespace "namespace uri";@namespace foo "bar";');
    });
    it('should parse @namespace blocks', function() {
        assert.equal(parseString('@namespace empty "namespace uri";'),
                     '@namespace empty "namespace uri";');
    });
});
