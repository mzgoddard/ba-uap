!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.Element=e():(t.BoxArt=t.BoxArt||{},t.BoxArt.Element=e())}("undefined"!=typeof self?self:this,function(){return function(t){function e(o){if(n[o])return n[o].exports;var i=n[o]={i:o,l:!1,exports:{}};return t[o].call(i.exports,i,i.exports,e),i.l=!0,i.exports}var n={};return e.m=t,e.c=n,e.d=function(t,n,o){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:o})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=9)}([,,,,,,,,,function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(10);e.default=o.a},function(t,e,n){"use strict";function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=n(11),a=n(12),r=function(){function t(e){o(this,t),this.loop=e.loop||a.a.main,this.animations=e.animations;var n=e.element,r=e.initialState;this.state=new i.a(this.animations),console.log("AnimatedSvg",e),n&&this.state.schedule({root:{element:n}},this.loop),r&&this.set(r)}return t.prototype.set=function(t,e){this.state.set(t,e||t)},t.prototype.unschedule=function(){this.state.unschedule()},t}();e.a=r},function(t,e,n){"use strict";function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(t,e){return t};i.copy=function(t){return t},i.merge=function(t){return t};var a=function(){};a.done=function(){return!0};var r=function(){};r.store=function(){},r.restore=function(){};var s={update:i,animate:a,present:r},u=function(){},l=0,c="__init__",f=function(t){t.loop.soon().then(function(){return d(t,3)})},h=function(t){t.loop.soon().then(function(){return p(t,0)})},d=function(t,e){var n=t.transitionState,o=0;if((3===n||7===n)&&3===e){3===n&&(t.animation={});var u=t.get()||"default",c=t.animations.default||s,d=t.animations[u]||c,m=t.animation.update=d.update||c.update||i;t.animation.animate=d.animate||c.animate||a;var v=t.animation.present=d.present||c.present||r,y=t.data,g=y.animated.root;return y.lastT=y.t,y.t=0,y.end=m(y.end,g.element,y),3===t.transitionState?(y.state=m.copy(y.state,y.end),y.begin=m.copy(y.begin,y.end)):(y.state=m.merge(y.state,y.end),y.begin=m.merge(y.begin,y.end)),y.store=v.store(y.store,g.element,y),t.loop.add(p,t),t.transitionState=8,void h(t)}if(n===l)0===e?n=1:1===e&&(n=2);else if(1===n)1===e&&(o=2,n=3);else if(2===n)0===e?(o=2,n=3):2===e&&(n=l);else if(4===n)0===e?n=5:1===e&&(n=6);else if(5===n)0===e?o=1:1===e&&(o=2,n=7);else if(6===n)0===e?(o=2,n=7):2===e&&(n=4);else if(7===n)0===e?o=1:2===e&&(n=5);else if(8===n){if(0===e||4===e||2===e){2!==e&&t.resolve();var E=t.data;t.animation.present.restore(E.animated.root.element,E.store,E),t.animation.update.copy(E.begin,E.state),t.loop.remove(p,t)}0===e?(o=2,n=7):2===e?n=5:4===e&&(n=6)}0!==o&&(1===o?t.resolve():2===o&&f(t)),n!==t.transitionState&&(t.transitionState=n)},p=function(t,e){if(8===t.transitionState){var n=t.data,o=t.animation,i=o.animate,a=o.present;n.t+=e,i(n.t,n.state,n.begin,n.end,n),i.done&&i.done(n.t,n.state,n.begin,n.end,n)?d(t,4):a(n.animated.root.element,n.state,n)}},m=function(){function t(e){o(this,t),this.state=c,this.transitionState=l,this.animation=null,this.animations=e,this.data={t:0,lastT:0,store:null,state:null,begin:null,end:null,animated:null},this.resolve=u}return t.prototype.get=function(){return this.state},t.prototype.set=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:u;this.state=t,d(this,0),this.resolve=e},t.prototype.setThen=function(t){var e=this;return new Promise(function(n){return e.set(t,n)})},t.prototype.schedule=function(t,e){this.data.animated=t,this.loop=e,d(this,1)},t.prototype.unschedule=function(){d(this,2),this.data.animated=null},t.prototype.transitionStep=function(t){d(this,t)},t.prototype.step=function(t){p(this,t)},t}();e.a=m},function(t,e,n){"use strict";function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i,a=2,r=(i={},i.BEFORE_ITEMS=0,i.AFTER_ITEMS=1,i.ITEMS=2,i.ANIMATE=3,i.DESTROY=4,i),s=function(t,e){var n=t._state,o=t._state;0===o&&1===e||3===o&&3===e?o=a:0===o&&2===e||3===o&&0===e?o=1:1===o&&1===e||o===a&&2===e?o=3:(1===o&&3===e||o===a&&0===e)&&(o=0),o!==n&&(t._state=o,3===n?t.cancelFrame():3===o&&(t.last=t.now(),t._frameId=t.requestFrame()))},u=function(t){var e=t[0],n=t[1],o=t[2];this.remove(e,n),this.remove(this._remove,t,o)},l=function(){this._soon=null},c=function(t){t.requestFrame();for(var e=t.cleanup,n=void 0,o=void 0,i=void 0,a=0,r=e.length;a<r;a+=2){n=e[a+0],o=e[a+1];for(var u=t.stages,l=Array.isArray(u),c=0,u=l?u:u[Symbol.iterator]();;){var f;if(l){if(c>=u.length)break;f=u[c++]}else{if(c=u.next(),c.done)break;f=c.value}var h=f;if("break"===function(e){if(-1!==(i=e.findIndex(function(t,i){return i%2==0&&t===n&&e[i+1]===o})))return e.splice(i,2),t.itemCount-=1,"break"}(h))break}}if(e.length=0,0===t.itemCount)return void s(t,3);var d=t.now(),p=Math.min((d-t.last)/1e3,.033);t.last=d;for(var m=t.stages,v=Array.isArray(m),y=0,m=v?m:m[Symbol.iterator]();;){var g;if(v){if(y>=m.length)break;g=m[y++]}else{if(y=m.next(),y.done)break;g=y.value}for(var E=g,_=0;_<E.length;_+=2)try{E[_+0](E[_+1],p)}catch(t){console.error(t?t.stack||t:t)}}},f=function(){function t(){var e=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},i=n.requestFrame,r=void 0===i?window.requestAnimationFrame:i,s=n.cancelFrame,f=void 0===s?window.cancelAnimationFrame:s,h=n.now,d=void 0===h?Date.now:h;o(this,t),this._state=a,this.itemCount=0,this.stages=[[],[],[],[],[]],this.cleanup=[],this._remove=u.bind(this),this._soonNull=l.bind(this),this.requestFrame=function(){e._frameId=r.call(null,function(){return c(e)})},this.cancelFrame=function(){f.call(null,e._frameId)},this.now=d}return t.prototype.pause=function(){s(this,0)},t.prototype.resume=function(){s(this,1)},t.prototype.add=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"ANIMATE";0===this.itemCount&&s(this,2),this.itemCount+=1,this.stages[r[n]].push(t,e)},t.prototype.remove=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;this.cleanup.push(t,e)},t.prototype.schedule=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"BEFORE_ITEMS";this.add(t,e,n)},t.prototype.unschedule=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;this.remove(t,e)},t.prototype.once=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"BEFORE_ITEMS";this.add(t,e,n),this.add(this._remove,[t,e,n],n)},t.prototype.soon=function(){return this._soon||(this._soon=Promise.resolve().then(this._soonNull)),this._soon},t}();f.stages={BEFORE_ITEMS:"BEFORE_ITEMS",AFTER_ITEMS:"AFTER_ITEMS",ITEMS:"ITEMS",ANIMATE:"ANIMATE",DESTROY:"DESTROY"},"function"==typeof requestAnimationFrame?f.main=new f:f.main=new f({requestFrame:function(t){return setTimeout(t,16)},cancelFrame:function(t){return clearTimeout(t)}}),e.a=f}])});