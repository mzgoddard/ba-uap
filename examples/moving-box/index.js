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

const animated = new Animated({
  elements: {
    root: document.querySelector('.box'),
  },
  // update: (element, state, animated)
  update: update.object({
    rect: element => {
      const r = element.getBoundingClientRect();
      const rect = {};
      for (let key in r) {
        rect[key] = r[key];
      }
      return rect;
    },
  }),
  animate: animate.duration(1, animate.object({
    rect: animate.object({
      top: animate.fromTo([animate.at(0), animate.at(1)]),
      left: animate.fromTo([animate.at(0), animate.at(1)]),
    }),
  })),
  present: present.styles({
    transform: present.translate([
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
});

document.querySelector('button').addEventListener('mousedown', () => {
  animated.render(() => {
    box.style.left = Math.random() * 500 + 'px';
    box.style.top = Math.random() * 500 + 'px';
  });
});

setInterval(() => {
  animated.render(() => {
    box.style.left = Math.random() * 500 + 'px';
    box.style.top = Math.random() * 500 + 'px';
  });
}, 1000);
