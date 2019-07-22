import * as assert from 'assert';

import {parsed, optimized} from './_helpers';

describe('Strings', () => {
  it('can be empty', () => {
    assert.equal(parsed('a{content:""}'), 'a{content:""}');
  });
  it('can contain a single char', () => {
    assert.equal(parsed('a{content:"("}'), 'a{content:"("}');
  });
  it('can contain another single char', () => {
    assert.equal(parsed('a{content:"a"}'), 'a{content:"a"}');
  });
  it('can contain escaped quotes', () => {
    assert.equal(parsed("a{content:'\\''}"), 'a{content:"\'"}');
    assert.equal(parsed('a{content:"\\""}'), "a{content:'\"'}");
  });
  it('can contain escaped line breaks', () => {
    assert.equal(parsed('a{content:"\\\n"}'), 'a{content:"\\\n"}');
  });
});

describe('URIs', () => {
  it('can contain data uris', () => {
    assert.equal(
      parsed(
        'a{content:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeD0iMTJweCIgeT0iMHB4IiB3aWR0aD0iMjRweCIgaGVpZ2h0PSIzcHgiIHZpZXdCb3g9Ij==)}',
      ),
      'a{content:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeD0iMTJweCIgeT0iMHB4IiB3aWR0aD0iMjRweCIgaGVpZ2h0PSIzcHgiIHZpZXdCb3g9Ij==)}',
    );
  });
  it('can be double quote', () => {
    assert.equal(parsed('a{content:url("foo")}'), 'a{content:url(foo)}');
  });
  it('can be single quote', () => {
    assert.equal(parsed("a{content:url('foo')}"), 'a{content:url(foo)}');
  });
  it('does not optimize', async () => {
    assert.equal(
      await optimized("a{content:url('foo')}", {o1: true}),
      'a{content:url(foo)}',
    );
  });
  it('can retain quotes', () => {
    assert.equal(parsed('a{content:url("foo)")}'), 'a{content:url("foo)")}');
    assert.equal(parsed("a{content:url('foo)')}"), 'a{content:url("foo)")}');
  });

  it('should normalize URIs on O1', async () => {
    const unnormalized = 'a{foo:url(../foo/../bar/./zap)}';
    assert.equal(parsed(unnormalized), unnormalized);
    assert.equal(await optimized(unnormalized), unnormalized);
    assert.equal(
      await optimized(unnormalized, {o1: true}),
      'a{foo:url(../bar/zap)}',
    );
  });

  it('should normalize URIs handling windows path separator', async () => {
    assert.equal(
      await optimized('a{foo:url(\\images/foo\\bar)}', {o1: true}),
      'a{foo:url(/images/foo/bar)}',
    );
  });
});

describe('Numbers', () => {
  it('should omit a leading 0 in negative floating point numbers', () => {
    assert.equal(parsed('a{foo:-0.5}'), 'a{foo:-.5}');
  });
  it('should omit a leading zero in floating point numbers', () => {
    assert.equal(parsed('a{foo:.5}'), 'a{foo:.5}');
  });
  it('should omit a trailing dot in floating point numbers', () => {
    assert.equal(parsed('a{foo:1.}'), 'a{foo:1}');
  });
  it('should support scientific notation', () => {
    assert.equal(parsed('a{foo:3e1}'), 'a{foo:30}');
    assert.equal(parsed('a{foo:3e2}'), 'a{foo:300}');
    assert.equal(parsed('a{foo:3e+2}'), 'a{foo:300}');
    assert.equal(parsed('a{foo:3e-2}'), 'a{foo:.03}');
  });
  it('should support unary plus', async () => {
    assert.equal(await optimized('a{foo:+.5}'), 'a{foo:.5}');
  });
  it('should not optimize', async () => {
    assert.equal(await optimized('a{foo:-.5}'), 'a{foo:-.5}');
  });
  it('should strip units when the dimension is zero', () => {
    assert.equal(parsed('a{foo:0px}'), 'a{foo:0}');
  });
  it('should not strip units when the dimension is zero percent', async () => {
    assert.equal(parsed('a{foo:0%}'), 'a{foo:0%}');
    assert.equal(await optimized('a{height:0%}'), 'a{height:0%}');
    assert.equal(await optimized('a{width:0%}'), 'a{width:0%}');
    assert.equal(await optimized('a{flex:0%}'), 'a{flex:0%}');
    assert.equal(await optimized('a{flex-basis:0%}'), 'a{flex-basis:0%}');
  });
});

describe('Identifiers', () => {
  it('can be normal identifiers', () => {
    assert.equal(parsed('a{foo:bar}'), 'a{foo:bar}');
  });
  it('can be n-resize', () => {
    assert.equal(
      parsed('a{nearly-cursor:n-resize}'),
      'a{nearly-cursor:n-resize}',
    );
  });
  it('can be not-allowed', () => {
    assert.equal(
      parsed('a{nearly-cursor:not-allowed}'),
      'a{nearly-cursor:not-allowed}',
    );
  });
  it('can be use old hacks in declaration names', () => {
    assert.equal(parsed('a{*foo: bar;}'), 'a{*foo:bar}');
  });
});

describe('Expressions', () => {
  it('can be parsed with spaces', () => {
    assert.equal(parsed('a{b:1 2 3}'), 'a{b:1 2 3}');
  });
  it('can be parsed with slashes', () => {
    assert.equal(parsed('a{b:1 2 / 3}'), 'a{b:1 2/3}');
  });
  it('can be parsed with commas', () => {
    assert.equal(parsed('a{b:1 2 , 3}'), 'a{b:1 2,3}');
  });
  it('can contain "to" inside functions', () => {
    assert.equal(
      parsed('a{b:linear-gradient(to bottom,#65a4e1,#3085d6)}'),
      'a{b:linear-gradient(to bottom,#65a4e1,#3085d6)}',
    );
  });

  it('should reduce font names', async () => {
    assert.equal(
      await optimized('a{font-family:"Open Sans","Helvetica",sans-serif;}'),
      'a{font-family:Open Sans,Helvetica,sans-serif}',
    );
  });
});

describe('Attribute functions', () => {
  it('can contain an attribute name', () => {
    assert.equal(parsed('a{foo:attr(data-foo)}'), 'a{foo:attr(data-foo)}');
  });
  it('can contain an element name with a unit', () => {
    assert.equal(
      parsed('a{foo:attr(data-foo px)}'),
      'a{foo:attr(data-foo px)}',
    );
  });
  it('can contain an element name with a unit with a fallback', () => {
    assert.equal(
      parsed('a{foo:attr(data-foo px, 123px)}'),
      'a{foo:attr(data-foo px,123px)}',
    );
  });
  it('can contain an element name and a fallback without a dimension', () => {
    assert.equal(
      parsed('a{foo:attr(data-foo, 123px)}'),
      'a{foo:attr(data-foo,123px)}',
    );
  });
});

describe('Custom Identifiers', () => {
  it('can be parsed alone', () => {
    assert.equal(parsed('a{b:[foo]}'), 'a{b:[foo]}');
  });
  it('can be parsed in a group', () => {
    assert.equal(parsed('a{b:[foo  bar]}'), 'a{b:[foo bar]}');
  });
});
