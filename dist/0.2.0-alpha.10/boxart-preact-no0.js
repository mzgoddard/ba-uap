!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e(require("preact"),require("preact/src/vnode")):"function"==typeof define&&define.amd?define(["preact","preact/src/vnode"],e):"object"==typeof exports?exports.Preact=e(require("preact"),require("preact/src/vnode")):(t.BoxArt=t.BoxArt||{},t.BoxArt.Preact=e(t.preact,t["preact/src/vnode"]))}("undefined"!=typeof self?self:this,function(t,e){return function(t){function e(r){if(n[r])return n[r].exports;var i=n[r]={i:r,l:!1,exports:{}};return t[r].call(i.exports,i,i.exports,e),i.l=!0,i.exports}var n={};return e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:r})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=28)}([function(e,n){e.exports=t},,,,,function(t,n){t.exports=e},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i,o=2,s=(i={},i.BEFORE_ITEMS=0,i.AFTER_ITEMS=1,i.ITEMS=2,i.ANIMATE=3,i.DESTROY=4,i),a=function(t,e){var n=t._state,r=t._state;0===r&&1===e||3===r&&3===e?r=o:0===r&&2===e||3===r&&0===e?r=1:1===r&&1===e||r===o&&2===e?r=3:(1===r&&3===e||r===o&&0===e)&&(r=0),r!==n&&(t._state=r,3===n?t.cancelFrame():3===r&&(t.last=t.now(),t._frameId=t.requestFrame()))},c=function(t){var e=t[0],n=t[1],r=t[2];this.remove(e,n),this.remove(this._remove,t,r)},h=function(){this._soon=null},u=function(t){t.requestFrame();for(var e=t.cleanup,n=void 0,r=void 0,i=void 0,o=0,s=e.length;o<s;o+=2){n=e[o+0],r=e[o+1];for(var c=t.stages,h=Array.isArray(c),u=0,c=h?c:c[Symbol.iterator]();;){var l;if(h){if(u>=c.length)break;l=c[u++]}else{if(u=c.next(),u.done)break;l=u.value}var f=l;if("break"===function(e){if(-1!==(i=e.findIndex(function(t,i){return i%2==0&&t===n&&e[i+1]===r})))return e.splice(i,2),t.itemCount-=1,"break"}(f))break}}if(e.length=0,0===t.itemCount)return void a(t,3);var p=t.now(),d=Math.min((p-t.last)/1e3,.033);t.last=p;for(var m=t.stages,v=Array.isArray(m),y=0,m=v?m:m[Symbol.iterator]();;){var b;if(v){if(y>=m.length)break;b=m[y++]}else{if(y=m.next(),y.done)break;b=y.value}for(var g=b,_=0;_<g.length;_+=2)try{g[_+0](g[_+1],d)}catch(t){console.error(t?t.stack||t:t)}}},l=function(){function t(){var e=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},i=n.requestFrame,s=void 0===i?window.requestAnimationFrame:i,a=n.cancelFrame,l=void 0===a?window.cancelAnimationFrame:a,f=n.now,p=void 0===f?Date.now:f;r(this,t),this._state=o,this.itemCount=0,this.stages=[[],[],[],[],[]],this.cleanup=[],this._remove=c.bind(this),this._soonNull=h.bind(this),this.requestFrame=function(){e._frameId=s.call(null,function(){return u(e)})},this.cancelFrame=function(){l.call(null,e._frameId)},this.now=p}return t.prototype.pause=function(){a(this,0)},t.prototype.resume=function(){a(this,1)},t.prototype.add=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"ANIMATE";0===this.itemCount&&a(this,2),this.itemCount+=1,this.stages[s[n]].push(t,e)},t.prototype.remove=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;this.cleanup.push(t,e)},t.prototype.schedule=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"BEFORE_ITEMS";this.add(t,e,n)},t.prototype.unschedule=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;this.remove(t,e)},t.prototype.once=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"BEFORE_ITEMS";this.add(t,e,n),this.add(this._remove,[t,e,n],n)},t.prototype.soon=function(){return this._soon||(this._soon=Promise.resolve().then(this._soonNull)),this._soon},t}();l.stages={BEFORE_ITEMS:"BEFORE_ITEMS",AFTER_ITEMS:"AFTER_ITEMS",ITEMS:"ITEMS",ANIMATE:"ANIMATE",DESTROY:"DESTROY"},"function"==typeof requestAnimationFrame?l.main=new l:l.main=new l({requestFrame:function(t){return setTimeout(t,16)},cancelFrame:function(t){return clearTimeout(t)}}),e.a=l},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var s=n(8),a=function(t){function e(n,o,s){r(this,e);var a=i(this,t.call(this,s));return a.bus=n,a.tree=o,a}return o(e,t),e.prototype.can_=function(t,e,n){var r=this.tree.get(e).meta(n);return!!r.can&&(r.can[t]||!1)},e.prototype.canEnter=function(t,e){return this.can_("enter",t,e)},e.prototype.canLeave=function(t,e){return this.can_("leave",t,e)},e.prototype.didEnter=function(t,e){return this.tree.get(t).meta(e).didEnter},e.prototype.didLeave=function(t,e){return this.tree.get(t).meta(e).didLeave},e}(s.a);e.a=a},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(){function t(e){r(this,t),this.matcher=e}return t.prototype.matchNode=function(t){if(t.__boxartPreactMatchType)return this.matcher._match.type=t.__boxartPreactMatchType,this.matcher._match.id=t.__boxartPreactMatchId,this.matcher._match.animation=t.__boxartPreactMatchAnimation,!0;if("string"==typeof t.nodeName){var e=t.attributes&&t.attributes.class;if(e&&this.match(e))return t.__boxartPreactMatchType=this.matcher._match.type,t.__boxartPreactMatchId=this.matcher._match.id,t.__boxartPreactMatchAnimation=this.matcher._match.animation,!0}return!1},t.prototype.match=function(t){return this.matcher.match(t)},t.prototype.matchType=function(){return this.matcher.matchType()},t.prototype.matchId=function(){return this.matcher.matchId()},t.prototype.matchAnimation=function(){return this.matcher.matchAnimation()},t}();e.a=i},,,,,,,,,,,,,,,,,,,,function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var s=n(0),a=(n.n(s),n(29)),c=n(30),h=n(32),u=n(33),l=n(34),f=n(6),p=n(36),d=n(37),m=n(38),v=n(39),y=n(40),b=n(41);n.d(e,"RunLoop",function(){return f.a});var g=function(t){function e(){r(this,e);for(var n=arguments.length,o=Array(n),s=0;s<n;s++)o[s]=arguments[s];var g=i(this,t.call.apply(t,[this].concat(o))),_=g.props,w=_.loop,E=_.animations,O=new h.a,T={},j=new l.a;Object.keys(E).forEach(function(t){j.add(t,Object.keys(E[t])),T[t.split(" ")[0]]=E[t]});var A=new c.a(E),x=A.create,N=new a.a(x,w||f.a.main);new u.a(N,O),g.crawler=new d.a(O,j);var P=new b.a(new v.a(j));return new y.a(g.crawler,O,P,j),new p.a(O,P,j),new m.a(O,P,j),g}return o(e,t),e.prototype.render=function(t){var e=t.children;return this.crawler.inject(e[0],"root",!0)},e.prototype.getManager=function(){return this.manager},e.prototype.getAnimated=function(t){return this.manager.getAnimated(t.base||t)},e}(s.Component);e.default=g},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=n(6),o=function(){function t(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:i.a.main;r(this,t),this.factory=e,this.loop=n,this.states={},this.elementToId=new Map}return t.prototype.get=function(t,e){var n=this.states[e];return n||(n=this.states[e]=this.factory(t)),n},t.prototype.set=function(t,e,n,r){var i=this.get(t,e);return i.set(n||"default",null,r),i},t.prototype.delete=function(t,e){this.states[e]&&(this.states[e].unschedule(),this.states[e]=null)},t.prototype.setElement=function(t,e,n){var r=this.get(t,e);if(r){this.elementToId.set(n,e);var i=r.data.animated||{root:{element:null}};i.root.element=n,r.schedule(i,this.loop)}},t.prototype.getAnimatedState=function(t){this.states[this.elementToId.get(t)]},t.prototype.getAnimated=function(t){var e=this.getAnimatedState(t);return e&&e.data.animated},t}();e.a=o},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=n(31),o=function(){function t(e){r(this,t),this.animations=e,this.create=this.create.bind(this)}return t.prototype.create=function(t){return new i.a(this.animations[t])},t}();e.a=o},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(t,e){return t};i.copy=function(t){return t},i.merge=function(t){return t};var o=function(){};o.done=function(){return!0};var s=function(){};s.store=function(){},s.restore=function(){};var a={update:i,animate:o,present:s},c=function(){},h=0,u="__init__",l=function(t){t.loop.soon().then(function(){return p(t,3)})},f=function(t){t.loop.soon().then(function(){return d(t,0)})},p=function(t,e){var n=t.transitionState,r=0;if((3===n||7===n)&&3===e){3===n&&(t.animation={});var c=t.get()||"default",u=t.animations.default||a,p=t.animations[c]||u,m=t.animation.update=p.update||u.update||i;t.animation.animate=p.animate||u.animate||o;var v=t.animation.present=p.present||u.present||s,y=t.data,b=y.animated.root;return y.lastT=y.t,y.t=0,y.end=m(y.end,b.element,y),3===t.transitionState?(y.state=m.copy(y.state,y.end),y.begin=m.copy(y.begin,y.end)):(y.state=m.merge(y.state,y.end),y.begin=m.merge(y.begin,y.end)),y.store=v.store(y.store,b.element,y),t.loop.add(d,t),t.transitionState=8,void f(t)}if(n===h)0===e?n=1:1===e&&(n=2);else if(1===n)1===e&&(r=2,n=3);else if(2===n)0===e?(r=2,n=3):2===e&&(n=h);else if(4===n)0===e?n=5:1===e&&(n=6);else if(5===n)0===e?r=1:1===e&&(r=2,n=7);else if(6===n)0===e?(r=2,n=7):2===e&&(n=4);else if(7===n)0===e?r=1:2===e&&(n=5);else if(8===n){if(0===e||4===e||2===e){2!==e&&t.resolve();var g=t.data;t.animation.present.restore(g.animated.root.element,g.store,g),t.animation.update.copy(g.begin,g.state),t.loop.remove(d,t)}0===e?(r=2,n=7):2===e?n=5:4===e&&(n=6)}0!==r&&(1===r?t.resolve():2===r&&l(t)),n!==t.transitionState&&(t.transitionState=n)},d=function(t,e){if(8===t.transitionState){var n=t.data,r=t.animation,i=r.animate,o=r.present;n.t+=e,i(n.t,n.state,n.begin,n.end,n),i.done&&i.done(n.t,n.state,n.begin,n.end,n)?p(t,4):o(n.animated.root.element,n.state,n)}},m=function(){function t(e){r(this,t),this.state=u,this.transitionState=h,this.animation=null,this.animations=e,this.data={t:0,lastT:0,store:null,state:null,begin:null,end:null,animated:null},this.resolve=c}return t.prototype.get=function(){return this.state},t.prototype.set=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:c;this.state=t,p(this,0),this.resolve=e},t.prototype.setThen=function(t){var e=this;return new Promise(function(n){return e.set(t,n)})},t.prototype.schedule=function(t,e){this.data.animated=t,this.loop=e,p(this,1)},t.prototype.unschedule=function(){p(this,2),this.data.animated=null},t.prototype.transitionStep=function(t){p(this,t)},t.prototype.step=function(t){d(this,t)},t}();e.a=m},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(){function t(){r(this,t),this.set=[]}return t.prototype.values=function(){return this.set},t.prototype.add=function(t){this.set.push(t)},t.prototype.delete=function(t){var e=this.set.indexOf(t);-1!==e&&this.set.splice(e,1)},t}(),o=function(){function t(){r(this,t),this.bound={},this.sets={}}return t.prototype.setFor=function(t,e){return this.sets[t]=this.sets[t]||{},"*"===e?this.sets[t].__all__=this.sets[t].__all__||new i:this.sets[t][e]=this.sets[t][e]||new i},t.prototype.bind=function(t,e){if(!this.bound[t]){var n=t.split(":"),r=n[0],i=n[1],o=this.setFor(r,"*"),s=this.setFor(r,i);if(3===e){var a=o.values(),c=s.values();this.bound[t]=function(t,e,n){for(var r=0,o=a.length;r<o;)a[r++](i,t,e,n);for(var s=0,h=c.length;s<h;)c[s++](t,e,n)}}else this.bound[t]=function(){for(var t=arguments.length,e=Array(t),n=0;n<t;n++)e[n]=arguments[n];for(var r=o.values(),a=Array.isArray(r),c=0,r=a?r:r[Symbol.iterator]();;){var h;if(a){if(c>=r.length)break;h=r[c++]}else{if(c=r.next(),c.done)break;h=c.value}h.apply(void 0,[i].concat(e))}for(var u=s.values(),l=Array.isArray(u),f=0,u=l?u:u[Symbol.iterator]();;){var p;if(l){if(f>=u.length)break;p=u[f++]}else{if(f=u.next(),f.done)break;p=f.value}p.apply(void 0,e)}}}return this.bound[t]},t.prototype.on=function(t,e){var n=t.split(":"),r=n[0],i=n[1],o=this.setFor(r,i);return o.add(e),function(){return o.delete(e)}},t}();e.a=o},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(){function t(e,n){r(this,t),this.manager=e,this.bus=n,this.stateBegin=n.bind("state:begin",3),this.stateEnd=n.bind("state:end",3),n.on("state:change",this.set.bind(this)),n.on("state:destroy",e.delete.bind(e)),n.on("element:create",e.setElement.bind(e)),n.on("element:update",e.setElement.bind(e)),n.on("element:destroy",e.delete.bind(e))}return t.prototype.set=function(t,e,n,r){var i=this,o=this.manager.set(t,e,n,r);this.stateBegin(t,e,n),o.resolve=function(){return i.stateEnd(t,e,n)}},t}();e.a=i},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=n(35),o=function(){function t(){r(this,t),this.patterns=new i,this.results={},this.idToTypes={},this._match={last:"",type:"",id:"",animation:""}}return t.prototype.add=function(t,e){var n=t.split(" "),r=n[0],o=n[1];o?(o=o.replace("{type}",r).replace("{id}","*"),-1===o.indexOf("*")&&(o+="*")):o=r+"*",this.patterns.add(r),this.patterns.add(o),this.idToTypes[o]=r;var s={id:(new i).add(o),animationNames:e,hasAnimation:{},animations:new i};e.forEach(function(t){s.animations.add(t.replace("{type}",r)),s.hasAnimation[t]=!0}),s.animations.add(o),this.results[r]=s},t.prototype.match=function(t){if(this._match.last===t)return Boolean(this.results[this._match.type]);this._match.last=t;var e=this._match.type=this.patterns.search(t);if(!e)return this._match.animation=null,this._match.id=null,!1;var n=void 0,r=void 0,i=void 0,o=this.patterns.begin,s=this.patterns.end;return e&&e.endsWith("*")?(e=this.idToTypes[e],i=this.results[e],r=i.animations.search(t,o,s+1)):(i=this.results[e],r=i.animations.search(t,s)),r?r.endsWith("*")?(n=t.substring(i.animations.begin,i.animations.end),(r=i.animations.search(t,i.animations.end))||(r=i.animations.search(t,0,o+1))):n||(i.id.search(t,i.animations.end)?n=t.substring(i.id.begin,i.id.end):i.id.search(t,0,o+1)&&(n=t.substring(i.id.begin,i.id.end))):(r=i.animations.search(t,0,o+1),r?r.endsWith("*")?(n=t.substring(i.animations.begin,i.animations.end),r=i.animations.search(t,i.animations.end,o+1)):n||i.id.search(t,i.animations.end,o+1)&&(n=t.substring(i.id.begin,i.id.end)):n||i.id.search(t,0,o+1)&&(n=t.substring(i.id.begin,i.id.end))),this._match.type=e,this._match.animation=r||"default",this._match.id=n||e,!0},t.prototype.matchType=function(){return this._match.type},t.prototype.matchAnimation=function(){return this._match.animation},t.prototype.matchId=function(){return this._match.id},t.prototype.matchHasAnimation=function(t){return this.results[this.matchType()].hasAnimation[t]||!1},t}();e.a=o},function(t,e){function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var r=function(){function t(){n(this,t),this.patterns=[],this._dirty=!0,this.code=[],this.answers=[]}return t.prototype.add=function(t){return this.patterns.push({pattern:t,chars:t+"\0",codes:(t+"\0").split("").map(function(t){return t.charCodeAt(0)})}),this._dirty=!0,this},t.prototype.rebuild=function(){for(var t={},e=[],n=[],r=0;r<this.patterns.length;r++){for(var i=this.patterns[r],o=t,s=0;s<i.codes.length-1;s++){var a=i.codes[s];if(42!==a)o=o[a]=o[a]||{};else for(var c={},h=[[o,Object.keys(o),0]];h.length;){var u=h.pop();o=u[0];var l=u[1],f=u[2];if(f<l.length){var p=o[l[f]];h.push([o,l,f+1]),p.pattern||h.push([p,Object.keys(p),0])}else o=o[42]=c}}o[32]=i,o[0]=i}for(var d=e.length,m=Object.entries(t),v=0;v<m.length;v++)e[d++]=m[v][0],e[d++]=m[v][1];e[d++]=-1,e[d++]=-1;for(var y=0;y<e.length;){var b=e[y+1];if(-1!==b)if(b.pattern)e[y+1]=-n.length,n.push(b.pattern),y+=2;else{e[y+1]=d,m=Object.entries(b),m.sort(function(t,e){var n=t[0],r=e[0];return 42===Number(n)?1:42===Number(r)?-1:Number(n)-Number(r)});for(var g=0;g<m.length;g++)e[d++]=m[g][0],e[d++]=m[g][1];e[d++]=-1,e[d++]=-1,y+=2}else y+=2}this.code=new Int32Array(e),this.answers=n,this._dirty=!1},t.prototype.search=function(t,e,n){if(this._dirty){if(0===this.patterns.length)return!1;this.rebuild()}this.begin=e||0,this.end=e||0;for(var r=t+"\0",i=this.code,o=0,s=e||0,a=n||r.length;s<a;++s){var c=r.charCodeAt(s);if(i[o]===c){if(i[o+1]<=0)return this.end=s,this.answers[-i[o+1]];o=i[o+1]}else if(42===i[o]&&32!==c&&0!==c){for(o=i[o+1];++s<a&&32!==(c=r.charCodeAt(s))&&0!==c;);--s}else if(--s,o+=2,-1===i[o]){for(o=0;++s<a&&32!==r.charCodeAt(s););this.begin=s+1}}return!1},t}();t.exports=r},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var s=n(7),a=function(t){function e(n,o,s){r(this,e);var a=i(this,t.call(this,n,o,s));return a.bus=n,a.components={},a.stateChange=a.bus.bind("state:change",3),a}return o(e,t),e}(s.a);e.a=a},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var s=n(0),a=(n.n(s),n(5)),c=(n.n(a),n(8)),h=a.VNode,u=function(t){return t.hooked},l=function(t){function e(n,o){r(this,e);var s=i(this,t.call(this,o));return s.bus=n,s.change=n.bind("state:change",4),s.create=n.bind("element:create",3),s.update=n.bind("element:update",3),s.destroy=n.bind("element:destroy",2),s.componentCreate=n.bind("component:create",3),s.componentUpdate=n.bind("component:update",3),s.componentDestroy=n.bind("component:destroy",2),s.elementClaims={},s.statelessMap=new WeakMap,s}return o(e,t),e.prototype.children=function(t,e){if(!t||!t.length)return t;for(var n=t,r=0,i=n.length;r<i;r++){var o=n[r],s=o,a=e+"."+(this.matchNode(s)&&this.matchId()||s.key||r),c=this.inject(o,a);c!==o&&(n===t&&(n=t.slice()),n[r]=c)}return n},e.prototype.inject=function(t,e,n){var r=this;if(!t)return t;if("function"==typeof t.nodeName){if(t.nodeName.prototype&&t.nodeName.prototype.render){if(t.attributes&&t.attributes.ref){var i=t.attributes&&t.attributes.ref;return this.cloneStateful(t,function(t){i(t),r.statefulHook(t,e)})}return this.cloneStateful(t,function(t){r.statefulHook(t,e)})}return this.cloneStateless(t,e)}var o=t.children,s=this.children(o,e);if(t.attributes&&t.attributes.class&&this.matchNode(t)){var a=this.matcher._match.type,c=this.matcher._match.id;this.change(a,c,this.matcher._match.animation,e+" "+t.attributes.class);var h=this.elementClaims[c];this.elementClaims[c]=function(){return u=2,!0};var u=h&&h()?1:0;if(t.attributes&&t.attributes.ref){var l=t.attributes&&t.attributes.ref;return this.cloneElement(t,s,function(t){l(t),t?u=r.elementRef(u,a,c,t):Promise.resolve().then(function(){u=r.elementRef(u,a,c,t)})})}return this.cloneElement(t,s,function(t){t?u=r.elementRef(u,a,c,t):Promise.resolve().then(function(){u=r.elementRef(u,a,c,t)})})}return s!==o?this.cloneElement(t,s):t},e.prototype.cloneStateful=function(t,e){var n=new h;n.nodeName=t.nodeName,n.children=t.children,n.attributes=Object.assign({},t.attributes),n.attributes.ref=e,n.key=t.key;var r=new h;return r.nodeName=u,r.children=null,r.attributes={key:t.key,hooked:n,nodeName:t.nodeName},r.key=t.key,r},e.prototype.statefulHook=function(t,e){var n=this;if(t&&t.render&&!t.render.crawled){var r=e+"."+t.constructor.name,i=t.render;t.render=function(e,o,s){return n.inject(i.call(t,e,o,s),r,!0)},t.render.crawled=!0}},e.prototype.cloneStateless=function(t,e){var n=this,r=new h,i=e+"."+t.nodeName.name;if(r.nodeName=this.statelessMap.get(t.nodeName),!r.nodeName){var o=function(t,e){var r=t.props,i=t.nodeName,o=t.path;return n.statelessHook(i,o,r,e)};r.nodeName=o,this.statelessMap.set(t.nodeName,o)}return r.children=t.children,r.attributes={props:t.children?Object.assign({},t.attributes,{children:t.children}):t.attributes,nodeName:t.nodeName,path:i},r.key=t.key,r},e.prototype.statelessHook=function(t,e,n,r){return this.inject(t(n,r),e,!0)},e.prototype.cloneElement=function(t,e,n){var r=new h;return r.nodeName=t.nodeName,r.children=e,r.attributes=Object.assign({},t.attributes),n&&(r.attributes.ref=n),r.key=t.key,r},e.prototype.elementRef=function(t,e,n,r){switch(t){case 0:return this.create(e,n,r),1;case 1:return r?(this.update(e,n,r),1):(this.elementClaims[n]=null,this.destroy(e,n),2);default:return 2}},e}(c.a);e.a=l},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var s=n(7),a=n(6),c=function(){return!1},h=function(t){function e(n,o,s,c){r(this,e);var h=i(this,t.call(this,n,o,s));return h.loop=c||a.a.main,h.alive={},h.left={},h.stateChange=h.bus.bind("state:change",3),h.stateDestroy=h.bus.bind("state:destroy",2),h.bus.on("state:begin",h.onStateBegin.bind(h)),h.bus.on("state:end",h.onStateEnd.bind(h)),h.bus.on("element:create",h.onElementCreate.bind(h)),h.bus.on("element:update",h.onElementUpdate.bind(h)),h.bus.on("element:destroy",h.onElementDestroy.bind(h)),h}return o(e,t),e.prototype.onStateBegin=function(t,e,n){this.alive[e]&&this.alive[e](!0)},e.prototype.onStateEnd=function(t,e,n){var r=this;"leave"===n&&this.tree.element(e)&&Promise.race([new Promise(function(t){r.alive[e]=t}),this.loop.soon().then(c)]).then(function(n){r.alive[e]=null,n||(r.tree.element(e).remove(e),r.stateDestroy(t,e))})},e.prototype.onElementCreate=function(t,e,n){var r=this.tree.element(e);if(r){var i=r.meta(e);i.can=this.matcher.results[t].hasAnimation,!i.didEnter&&i.can.enter&&r.count>1&&this.stateChange(t,e,"enter"),i.didEnter=!0}},e.prototype.onElementUpdate=function(t,e,n){var r=this.tree.element(e);if(r){var i=r.meta(e);i.can||(i.can=this.matcher.results[t].hasAnimation),i.didLeave?(i.leaving||(i._leaving=n.className,i.leaving=n.className+" leave",this.left[e]=[i.leaving,n.className]),n.className=i.leaving,this.stateChange(t,e,"leave")):this.left[e]&&(n.className===this.left[e][0]&&(n.className=this.left[e][1]),this.left[e]=null,i._leaving=null,i.leaving=null),!i.didEnter&&i.can.enter&&r.count>1&&this.stateChange(t,e,"enter"),i.didEnter=!0}},e.prototype.onElementDestroy=function(t,e,n){this.left[e]&&(this.left[e]=null),this.tree.element(e)&&this.tree.element(e).remove(e)},e}(s.a);e.a=h},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var s=n(8),a=function(t){function e(n){r(this,e);var o=i(this,t.call(this,n));return o.isElement=o.isElement.bind(o),o.nodeId=o.nodeId.bind(o),o}return o(e,t),e.prototype.isElement=function(t){return"string"==typeof t.nodeName},e.prototype.nodeId=function(t){return"string"!=typeof t.nodeName?t.key:t.__boxartPreactMatchId?t.__boxartPreactMatchId:this.matchNode(t)?(t.__boxartPreactMatchId=this.matchId(),t.__boxartPreactMatchId):void 0},e}(s.a);e.a=a},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var s=n(7),a=function(t){function e(n,o,s,a){r(this,e);var c=i(this,t.call(this,o,s,a));c.nextDest=[],c.current=[],c.leaving=[];var h=n.inject.bind(n);n.inject=c.inject.bind(c,h);var u=n.children.bind(n);return n.children=c.children.bind(c,u),c}return o(e,t),e.prototype.inject=function(t,e,n,r){if(r){var i=this.tree.get(n),o=i.parentBranch,s=i.parentKey,a=this.tree.idGen.nodeId(e);o._meta[a||s]&&o._meta[s]||this.tree.remove(n),o.root(s,a,e);var c=o.parentKey,h=o.parentBranch;h._meta[c]=o._meta[s]=o.meta(a),o.count=h.count}return t(e,n)},e.prototype.children=function(t,e,n){var r=this.tree.get(n);r.update(e,this.current,this.leaving),r.count=(r.count||0)+1;for(var i=0;i<this.current.length;++i)r.meta(this.current[i]).didLeave=!1;for(var o=0;o<this.leaving.length;++o)r.meta(this.leaving[o]).didLeave||(this.canLeave(n,this.leaving[o])?r.meta(this.leaving[o]).didLeave=!0:r.remove(this.leaving[o]));var s=r.missedNodes(e,this.nextDest);return s===this.nextDest&&(this.nextDest=[]),t(s,n)},e}(s.a);e.a=a},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=n(42),o=function(){function t(e,n,i){r(this,t);var o=n.lastIndexOf(".");this.parentPath=n.substring(0,o),this.parentKey=n.substring(o+1),this.path=n,this.tree=e,this.order=[],this.missed=null,this._tmpOrder=[],this._tmp2Order=[],this._dirtyOrder=!1,this.mustAddNodes=!1,this.indices=[],this.nodes={},this._meta={},this.isElement=i.isElement,this.nodeId=i.nodeId}return t.prototype.meta=function(t){return this._meta[t]||(this._meta[t]={}),this._meta[t]},t.prototype.remove=function(t){if(this.nodes[t]){var e=this.nodes[t];if(this.nodes[t]=null,this._meta[t]=null,this._dirtyOrder=!0,e&&this.isElement(e)&&this.nodeId(e)&&this.tree.setElementPath(t,null),this.isRoot){for(var n=0;n<this.order.length;++n)this.tree.remove(this.path+"."+this.order[n]);this.tree.remove(this.path,this.isRoot)}else this.tree.remove(this.path+"."+t)}},t.prototype.root=function(t,e,n){if(this._updateOrder(),!this.nodes[e||t]||!this.nodes[t])for(var r=0;r<this.order.length;++r)this.remove(this.order[r]);this.nodes[e||t]=n,this.nodes[t]=n,this.order.length=0,this.order[0]=t,this.order[1]=e,this.isRoot=!0,this.isElement(n)&&e&&this.tree.setElementPath(e,this.path)},t.prototype._updateOrder=function(){if(this._dirtyOrder){for(var t=this.order.length-1;t>=0;--t)this.nodes[this.order[t]]||this.order.splice(t,1);this._dirtyOrder=!1}},t.prototype.update=function(t,e,n){e.length=0,n.length=0,this._tmpOrder.length=0,this.missed=n,this._updateOrder();var r=this._tmpOrder;if(t)for(var o=0;o<t.length;++o){var s=this.nodeId(t[o]);s?(e[o]=s,r[o]=s,this.nodes[s]=t[o],this.isElement(t[o])&&this.tree.setElementPath(s,this.path)):(e[o]=o,r[o]=o,this.nodes[o]=t[o])}var a=Object(i.a)(this.order,r,this._tmp2Order,n);if(a===this._tmpOrder){var c=this._tmpOrder;this._tmpOrder=this.order,this.order=c}else if(a===this._tmp2Order){var h=this._tmp2Order;this._tmp2Order=this.order,this.order=h}},t.prototype.missedNodes=function(t,e){for(var n=this.missed.length-1;n>=0;--n)this.nodes[this.missed[n]]||this.missed.splice(n,1);if(0===this.missed.length)return t;this._updateOrder(),e.length=this.order.length;for(var r=0;r<this.order.length;++r)e[r]=this.nodes[this.order[r]];return e},t}(),s=function(){function t(e){r(this,t),this.idGen=e,this.lists={},this.elementPaths={}}return t.prototype.get=function(t){return this.lists[t]||(this.lists[t]=new o(this,t,this.idGen),this.lists[t]&&(this.lists[t].parentBranch=this.get(this.lists[t].parentPath))),this.lists[t]},t.prototype.element=function(t){return this.lists[this.elementPaths[t]]},t.prototype.remove=function(t,e){if(this.lists[t])for(var n=this.lists[t],r=n.order,i=0,o=r.length;i<o;++i)n.nodes[r[i]]&&n.remove(r[i]);var s=t.substring(0,t.lastIndexOf(".")),a=t.substring(t.lastIndexOf(".")+1);e&&this.lists[s]&&this.lists[s].nodes[a]&&this.lists[s].remove(a),this.lists[t]=null},t.prototype.setElementPath=function(t,e){this.element(t)&&this.elementPaths[t]!==e&&this.element(t).nodes[t]&&this.element(t).remove(t),this.elementPaths[t]=e},t}();e.a=s},function(t,e,n){"use strict";var r={},i=[],o=function(t,e){if(t.length===e.length){for(var n=!0,r=0;n&&r<t.length;++r)n=t[r]===e[r];return n}return!1},s=function(t,e){for(var n=0,i=t.length;n<i;++n)r[t[n]]=-1;for(var o=0,s=e.length;o<s;++o)r[e[o]]=o},a=function(t,e){for(var n=!0,i=0;n&&i<t.length;++i)n=-1!==r[t[i]];return n},c=function(t,e,n,o){var s=n||i;s.length=0;for(var a=0;a<e.length;a++)s.push(e[a]);o.unshift(t[t.length-1]),s.unshift(t[t.length-1]);for(var c=t.length-2;c>-1;--c)-1===r[t[c]]&&(o.unshift(t[c]),s.unshift(t[c]));return s},h=function(t,e,n,o,s){var a=n||i;a.length=0;for(var c=0;c<e.length;c++)a.push(e[c]);for(var h=t.length-2;h>-1;--h)if(-1===r[t[h]]){var u=void 0;for(u=h+1;-1===r[t[u]]||r[t[u]]>s;++u);s=r[t[u]],o.unshift(t[h]),a.splice(s,0,t[h])}return a},u=function(t,e,n,i){if(0===t.length)return e;if(o(t,e))return t;if(s(t,e),a(t))return e;var u=r[t[t.length-1]];return-1===u?c(t,e,n,i):h(t,e,n,i,u)};e.a=u}])});