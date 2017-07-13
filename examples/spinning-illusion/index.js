import {Animated, animate, update, present} from 'uap';

import './index.styl';

const duration = (d, fn) => (t, state, begin, end) => {
  // console.log(Math.min(1, t / d));
  return fn(Math.min(1, t / d), state, begin, end);
};

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
    document.querySelector('.canvas').appendChild(div);

    animateds.push(new Animated({
      elements: {
        root: document.querySelector(`.box${i}`),
      },
      // update: (element, state, animated) => {},
      update: update.object({
        // rect: update.rect(),
        rect: (element, rect) => {
          rect = rect || {};
          const r = element.getBoundingClientRect();
          for (let key in r) {
            rect[key] = r[key];
          }
          return rect;
        },
      }),
      // animate: (t, state, begin, end) => {},
      animate: animate.duration(1, animate.object({
        rect: animate.object({
          top: animate.fromTo([animate.at(0), animate.at(1)]),
          left: animate.fromTo([animate.at(0), animate.at(1)]),
        }),
      })),
      // present: (element, state, animated) => {},
      present: present.styles({
        transform: present.translate([
          // present.offset(present.path([''])),
          offset(
            present.value(state => state.rect.left),
            (value, state, animated) => (value - animated.end.rect.left),
          ).px(),
          offset(
            present.value(state => state.rect.top),
            (value, state, animated) => value - animated.end.rect.top,
          ).px(),
        ]),
      }),
    }));
  }
};

const animateAll = () => {
  animateds.forEach(animated => animated.render(() => {
    animated.elements.root.element.style.left = Math.random() * 500 + 'px';
    animated.elements.root.element.style.top = Math.random() * 500 + 'px';
  }));
};

document.querySelector('select').addEventListener('change', () => {
  buildBoxes(Number(document.querySelector('select').value));
  requestAnimationFrame(animateAll);
});

buildBoxes(Number(document.querySelector('select').value));
requestAnimationFrame(animateAll);

setInterval(animateAll, 1000);
