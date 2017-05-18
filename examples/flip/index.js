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
  const n = Math.sqrt(count);
  for (let i = 0; i < count; i++) {
    // nums.push(i);
    const div = document.createElement('div');
    div.className = `box box${i}`;
    div.style.left = i % n * 50 + 'px';
    div.style.top = ((i / n) | 0) * 50 + 'px';
    const randomHexPair = (b, r) => (Math.random() * r + b).toString(16).substring(0, 2);
    const randomColor = () => {
      const rg = randomHexPair(64, 128);
      const b = randomHexPair(240, 16);
      return `#${rg}${rg}${b}`;
    };
    div.style.background = randomColor();
    document.querySelector('.canvas').appendChild(div);

    animateds.push(new Animated({
      elements: {
        root: document.querySelector(`.box${i}`),
      },
      // update: (element, state, animated) => {},
      update: update.object({
        zIndex: () => 0,
        background: randomColor,
        // rect: update.rect(),
        rect: (element, rect) => {
          rect = rect || {
            vangle: 0,
          };
          const r = element.getBoundingClientRect();
          for (let key in r) {
            rect[key] = r[key];
          }
          rect.vangle -= 180;
          return rect;
        },
      }),
      // update: (element, state, animated) => animated.newState,
      // animate: (t, state, begin, end) => {},
      // animate: animate.rect().easeInOut().duration(3),
      animate: animate.duration(3, animate.object({
        zIndex: animate.value(t => t < 1 ? 1 : 0),
        background: animate.value((t, state, begin, end) => t < 0.5 ? begin : end),
        rect: animate.object({
          // top: animate.beginToEnd(),
          top: animate.fromTo([animate.at(0), animate.at(1)]),
          left: animate.fromTo([animate.at(0), animate.at(1)]),
          vangle: animate.fromTo([animate.at(0), animate.at(1)]),
        }),
      })),
      // present: (element, state, animated) => {},
      // present: (element, state) => {
      //   // console.log(state.rect.vangle);
      //   // const ctx = element.getContext('2d');
      //   // ctx.drawImage(, , , , , , );
      // },
      // present: present.rect(),
      // present: (element, state) => {
      //
      // },
      // present: node3 => {
      //   node3.transform.position.x =
      //   node3.transform.rotation.x =
      // },
      // present: present.properties({
      //   transform: present.properties({
      //     position:
      //   }),
      // }),
      present: present.styles({
        zIndex: present.key('zIndex'),
        background: present.key('background'),
        transform: present.concat([
          'perspective(100px) ',
          // present.translate([offset(present.path(['rect', 'left']), present.path(['rect', 'left']))]),
          present.translate([
            // present.offset(present.path([''])),
            offset(
              present.value(state => state.rect.left),
              (value, state, animated) => value - animated.end.rect.left,
            ).px(),
            offset(
              present.value(state => state.rect.top),
              (value, state, animated) => value - animated.end.rect.top,
            ).px(),
          ]),
          ' ',
          present.func('rotateX')([
            present.value(state => state.rect.vangle).deg(),
          ]),
        ]),
      }),
    }));
  }
};

const animateAll = () => {
  animateds.forEach(animated => Math.random() > 0.995 ? animated.render(() => {
    animated.newState = {};
    // animated.elements.root.element.style.left = Math.random() * 500 + 'px';
    // animated.elements.root.element.style.top = Math.random() * 500 + 'px';
  }) : null);
};

document.querySelector('select').addEventListener('change', () => {
  buildBoxes(Number(document.querySelector('select').value));
  requestAnimationFrame(animateAll);
});

buildBoxes(Number(document.querySelector('select').value));
requestAnimationFrame(animateAll);

setInterval(animateAll, 100);
