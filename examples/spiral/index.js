import {Animated, animate, update, present} from 'uap';

import './index.styl';

// const delayDurationDelay = (d0, d1, d2, fn) => (t, state, begin, end) => {
//   // console.log(Math.min(1, t / d));
//   const d = d0 + d1;
//   return fn(Math.max(0, Math.min(1, (t - d0) / d1)), state, begin, end);
// };

const delayDurationDelay = (d0, d1, d2, fn) => animate.easing(fn, t => {
  return Math.max(0, Math.min(0.999, (t - d0) / d1));
});

const offset = (fn, offsetFn) => present.value((state, animated) => {
  return offsetFn(fn.value(state, animated), state, animated);
});

const box = document.querySelector('.box');

// const nums = [];
const animateds = [];
const buildBoxes = (count) => {
  animateds.forEach(a => {
    a.destroy();
    a.elements.root.element.remove();
  });
  animateds.length = 0;

  // nums.length = 0;
  for (let i = 0; i < count; i++) {
    // nums.push(i);
    const div = document.createElement('div');
    div.className = `box box${i}`;
    const randomHexPair = () => Math.random().toString(16).substring(2, 4);
    div.style.background = `#${randomHexPair()}${randomHexPair()}${randomHexPair()}`;
    div.style.left = '250px';
    div.style.top = '250px';
    document.querySelector('.canvas').appendChild(div);

    animateds.push(new Animated({
      elements: {
        root: document.querySelector(`.box${i}`),
      },
      // update: (element, state, animated) => {},
      update: update.object({
        // rect: update.rect(),
        t: () => 2 * Math.PI,
        // rect: (element, rect) => {
        //   rect = rect || {};
        //   const r = element.getBoundingClientRect();
        //   for (let key in r) {
        //     rect[key] = r[key];
        //   }
        //   return rect;
        // },
      }),
      // animate: (t, state, begin, end) => {},
      animate: delayDurationDelay(
        4 * ((count / 4 - ((i / 4) | 0)) / (count / 4)),
        4,
        3 * ((((i / 4) | 0)) / (count / 4)),
        animate.object({
          angle: animate.value(t => t * Math.PI * 2),
          delta: animate.value(t => (i % 4) / 2 + 0.5),
          yDelta: animate.value(t => Math.sin(Math.min(1, (t <= 0.5 ? t * 2 : -t * 2 + 2) * 4) * Math.PI / 2)),
          // rect: animate.object({
          //   top: animate.fromTo([animate.at(0), animate.at(1)]),
          //   left: animate.fromTo([animate.at(0), animate.at(1)]),
          // }),
        }),
      ),
      // present: (element, state, animated) => {},
      present: present.styles({
        transform: present.concat([
          present.translate([
            present.value(state => Math.cos(state.angle + Math.PI / 2) * 100 * state.delta).px(),
            present.value(state => -Math.sin(state.angle + Math.PI / 2) * 100 * state.yDelta * state.delta).px(),
          ]),
          ' ',
          present.func('rotateZ')([
            present.value(state => -state.angle * 4).rad(),
          ]),
        ]),
      }),
    }));
  }
};

const animateAll = () => {
  animateds.forEach(animated => animated.render(() => {
    // animated.elements.root.element.style.left = Math.random() * 500 + 'px';
    // animated.elements.root.element.style.top = Math.random() * 500 + 'px';
  }));
};

document.querySelector('select').addEventListener('change', () => {
  buildBoxes(Number(document.querySelector('select').value));
  requestAnimationFrame(animateAll);
});

buildBoxes(Number(document.querySelector('select').value));
requestAnimationFrame(animateAll);

setInterval(animateAll, 8000);
