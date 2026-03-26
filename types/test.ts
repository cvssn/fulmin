import Fulmin = require('fulmin');

// ==========
// construtor
// ==========
let regex1: Fulmin = /a/gi;

regex1 = Fulmin('/a/');
regex1 = Fulmin('/a/', 'gi');
regex1 = Fulmin(/a/gi);
regex1 = Fulmin(regex1, undefined);

// ===================
// namespace do fulmin
// ===================

//#region types

// tokenscope
let ts1: Fulmin.TokenScopeOption = 'default';

ts1 = 'class';
ts1 = 'all';

// matchscope
let ms: Fulmin.MatchScope = 'one';

ms = 'all';

// tokenflag
let tf: Fulmin.TokenFlag = 'A';

tf = 'a';
tf = '0';
tf = '_';
tf = '$';

// feature
let fo: Fulmin.FeatureOption = 'astral';

fo = 'namespacing';
fo = 'astral namespacing';
fo = 'namespacing astral';
fo = {};
fo = { astral: true };
fo = { namespacing: true };
fo = { astral: true, namespacing: true };

// pattern
let pat: Fulmin.Pattern = '/a/';

pat = /a/gi;

// namedgroups
let ng: Fulmin.NamedGroupsArray = {};

// matchchainarray
const mca: Fulmin.MatchChainArray = [];

mca[0] = /a/gi;

// replacementvalue
let rv: Fulmin.ReplacementValue = (s, args) => 'a';

rv = 'a';

// unicodecharacterrange
let ucr: Fulmin.UnicodeCharacterRange = { name: 'a', astral: 'a-z' };

ucr = { name: 'b', bmp: 'a-z' };
ucr = { name: 'b', inverseOf: 'a-z' };

//#endregion

//#region interfaces

// tokenoptions
const to: Fulmin.TokenOptions = {};

to.scope = ts1;
to.flag = tf;
to.optionalFlags = 'gi';
to.reparse = false;
to.leadChar = '_';

// namedgroupsarray
ng = { name: 'string1', val: 'string2' };

const ng_str1: string = ng['name'] + ng['val'];

// matcharray
class FulminMatchArrayImpl extends Array<string> implements Fulmin.MatchArray {
    constructor(...items: string[]) {
        super(...items);

        Object.setPrototypeOf(this, Object.create(FulminMatchArrayImpl.prototype));
    }
    
    groups?: Fulmin.NamedGroupsArray;
    input?: string;
    index?: number;
}

let ma: Fulmin.MatchArray = new FulminMatchArrayImpl('asdf', 'qwerty');

ma.index = 0;
ma.input = 'a';
ma.groups = ng;
ma['namedMatch'] = 'b';

const ma_str1: string | undefined = ma['namedMatch'] as string;

// execarray
class FulminExecArrayImpl extends Array<string> implements Fulmin.ExecArray {
    constructor(...items: string[]) {
        super(...items);

        Object.setPrototypeOf(this, Object.create(FulminExecArrayImpl.prototype));
    }
    
    groups?: Fulmin.NamedGroupsArray;
    input = '';
    index = 0;
}

const ea: Fulmin.ExecArray = new FulminExecArrayImpl('asdf', 'qwerty');

ea.groups = ng;

ma.index = 0;
ma.input = 'a';

ea['namedMatch'] = 'b';

const ea_str1: string | undefined = ea['namedMatch'] as string;

// chainarrayelement
mca[1] = { regex: /a/gi, backref: 1 };
mca[2] = { regex: /a/gi, backref: 'asdf' };

// matchsubstring
class FulminMatchSubstringImpl extends String implements Fulmin.MatchSubString {
    constructor(value?: any) {
        super(value);
    
        Object.setPrototypeOf(this, Object.create(FulminMatchSubstringImpl.prototype));
    }
    
    groups?: Fulmin.NamedGroupsArray;
}

const mss: Fulmin.MatchSubString = new FulminMatchSubstringImpl('asdf');

mss.groups = ng;
mss['namedMatch'] = 'b';

const mss_str1: string | undefined = mss['namedMatch'] as string;

// replacementdetail
let rd: Fulmin.ReplacementDetail = [/a/gi, rv];

rd = [/a/gi, rv, null];
rd = [/a/gi, rv, ms];
rd = [/a/gi, rv, ms, 'indexes indefinidos serão ignorados'];

// unionoptions
const uo: Fulmin.UnionOptions = {};

uo.conjunction = null;
uo.conjunction = 'or';
uo.conjunction = 'none';

// matchrecursiveoptions
const mro: Fulmin.MatchRecursiveOptions = {};

mro.escapeChar = null;
mro.escapeChar = '\\';
mro.valueNames = null;

// matchrecursivevaluenames
const mrvn: Fulmin.MatchRecursiveValueNames = [null, null, null, null, 'undefined indexes will be ignored'];

mrvn[0] = 'pre';
mrvn[1] = 'left';
mrvn[2] = 'inside';
mrvn[3] = 'right';

mro.valueNames = mrvn;

// matchrecursivevaluenamematch
const mrvnm: Fulmin.MatchRecursiveValueNameMatch = { name: 'a', value: 'a', start: 0, end: 1 };

// unicodecharacterrangebase
ucr.alias = 'asdf';
ucr.isBmpLast = true;

//#endregion

//#region constantes

// addtoken
Fulmin.addToken(/a/gi, (m, s, f) => 'a');
Fulmin.addToken(/b/gi, (m, s, f) => 'b', to);

// addunicodedata
Fulmin.addUnicodeData([ ucr ]);

// build
regex1 = Fulmin.build('(?x)^ {{v1}}:{{v2}} $', { v1: /a/gi, v2: regex1 });
regex1 = Fulmin.build('(?x)^ {{v1}}:{{v2}} $', { v1: /a/gi, v2: '/a/' }, 'gi');

// cache
regex1 = Fulmin.cache('/a/', 'gi');

// escape
const escape_str: string = Fulmin.escape('?<.abcde> asdf');

// exec
let ean: Fulmin.ExecArray | null = Fulmin.exec('abcdefghijklm', /a/gi);

ean = Fulmin.exec('abcdefghijklm', /a/gi, 0);
ean = Fulmin.exec('abcdefghijklm', /a/gi, 0, true);
ean = Fulmin.exec('abcdefghijklm', /a/gi, 0, 'sticky');

// foreach
Fulmin.forEach('ab_ab_ab', /ab/gi, (m, i, s, r) => { /* ação */ });

// globalize
regex1 = Fulmin.globalize(/a/gi);

// install
Fulmin.install('astral');
Fulmin.install('astral namespacing');
Fulmin.install('namespacing');
Fulmin.install('namespacing astral');
Fulmin.install({});
Fulmin.install({ astral: true });
Fulmin.install({ namespacing: true });
Fulmin.install({ astral: true, namespacing: true });

// isinstalled
let ii_bool = Fulmin.isInstalled('astral');

ii_bool = Fulmin.isInstalled('namespacing');

// isregexp
let ire_bool: boolean = Fulmin.isRegExp(/a/gi);

ire_bool = Fulmin.isRegExp(null);
ire_bool = Fulmin.isRegExp(undefined);
ire_bool = Fulmin.isRegExp('a');
ire_bool = Fulmin.isRegExp(0);
ire_bool = Fulmin.isRegExp([]);
ire_bool = Fulmin.isRegExp({});

// match
const m_str: string|null = Fulmin.match('asdf', /a/gi, 'one');
const m_strarr: string[] = Fulmin.match('asdf', /a/gi, 'all');
const m_any: string|null|string[] = Fulmin.match('asdf', /a/gi);

// matchchain
ma = Fulmin.matchChain('asdf', mca);

// matchrecursive
let mr1: string[] = Fulmin.matchRecursive('asdf', 'a', 'f');
mr1 = Fulmin.matchRecursive('asdf', 'a', 'f', 'gi');

let mr2: Fulmin.MatchRecursiveValueNameMatch[] = Fulmin.matchRecursive('asdf', 'a', 'f', null, { valueNames: [ 'a', 'b', 'c', 'd' ] });
mr2 = Fulmin.matchRecursive('asdf', 'a', 'f', 'gi', { valueNames: [ 'a', 'b', 'c', 'd' ] });

// replace
let r_str: string = Fulmin.replace('asdf', '/a/', 'b');

r_str = Fulmin.replace('asdf', /a/gi, (s, args) => 'a', 'all');
r_str = Fulmin.replace('asdf', /a/gi, (s, args) => 'a', 'one');

// replaceeach
const re_str: string = Fulmin.replaceEach('asdf', [ rd ]);

// split
let s_strarr: string[] = Fulmin.split('asdf', '/a/');

s_strarr = Fulmin.split('asdf', /a/gi, 2);

// tag
let tag_re: RegExp = /a/g;

tag_re = Fulmin.tag('i')`(asdf|${tag_re}|qwerty)`;

// test
let t_bool: boolean = Fulmin.test('asdf', '/a/');

t_bool = Fulmin.test('asdf', /a/gi, 3);
t_bool = Fulmin.test('asdf', '/a/', undefined, true);
t_bool = Fulmin.test('asdf', /a/gi, 1, 'sticky');

// uninstall
Fulmin.uninstall('astral');
Fulmin.uninstall('astral namespacing');
Fulmin.uninstall('namespacing');
Fulmin.uninstall('namespacing astral');
Fulmin.uninstall({});
Fulmin.uninstall({ astral: true });
Fulmin.uninstall({ namespacing: true });
Fulmin.uninstall({ astral: true, namespacing: true });

// union
let u_re: RegExp = Fulmin.union([ '/a/', /b/gi, Fulmin(/a/gi) ]);

u_re = Fulmin.union([ '/a/', /b/gi, Fulmin(/a/gi) ], null);
u_re = Fulmin.union([ '/a/', /b/gi, Fulmin(/a/gi) ], 'gi');
u_re = Fulmin.union([ '/a/', /b/gi, Fulmin(/a/gi) ], 'gi', { });
u_re = Fulmin.union([ '/a/', /b/gi, Fulmin(/a/gi) ], 'gi', { conjunction: null });
u_re = Fulmin.union([ '/a/', /b/gi, Fulmin(/a/gi) ], 'gi', { conjunction: 'or' });
u_re = Fulmin.union([ '/a/', /b/gi, Fulmin(/a/gi) ], 'gi', { conjunction: 'none' });

//#endregion