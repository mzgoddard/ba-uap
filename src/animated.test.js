import 'babel-polyfill';

import animate from './animate';
import Animated from './animated';
import present from './present';
import RunLoop from './runloop';
import update from './update';

let animated, options, loop, now;

beforeEach(async () => {
  now = 0;
  loop = new RunLoop({
    requestFrame: fn => setTimeout(fn, 0),
    cancelFrame: clearTimeout,
    now: () => now,
  });
  options = {
    animate: animate.object({
      position: animate.object({
        x: animate.fromTo([animate.at(0), animate.at(1)]),
      }),
    }),
    present: present.object({
      position: present.styles({
        left: present.key('x').px(),
      }),
    }),
    update: update.object({
      position: update.object({
        x: (element, state, animated) => animated.x,
      }),
    }),
    elements: {
      root: {style: {left: '10px', top: '20px'}},
    },
    loop,
  };
  animated = new Animated(options);
  animated.x = 10;

  await new Promise(resolve => setTimeout(resolve, 10));
});

afterEach(async () => {
  animated.destroy();
  loop.pause();
});

it('sets state', () => {
  expect(animated.state).toEqual({position: {x: 10}});
  expect(animated.begin).toEqual({position: {x: 10}});
  expect(animated.end).toEqual({position: {x: 10}});
  expect(animated.state).not.toBe(animated.begin);
  expect(animated.begin).not.toBe(animated.end);
});

it('stores style', () => {
  expect(animated.store).toEqual({style: {left: '10px'}});
});

it('animates', async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
  animated.render(() => {
    animated.x = 0;
  });
  expect(animated.state).toEqual({position: {x: 10}});
  expect(animated.begin).toEqual({position: {x: 10}});
  expect(animated.end).toEqual({position: {x: 10}});
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(animated.t).toBe(0);
  expect(animated.begin).toEqual({position: {x: 10}});
  expect(animated.end).toEqual({position: {x: 0}});
  expect(animated.state).toEqual({position: {x: 10}});
  now = 500;
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(animated.t).toBe(0.5);
  expect(options.elements.root).toEqual({style: {left: '5px', top: '20px'}});
});

it('restores style', async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
  animated.render(() => {
    animated.x = 0;
  });
  await new Promise(resolve => setTimeout(resolve, 0));
  now = 500;
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(animated.t).toBe(0.5);
  expect(options.elements.root).toEqual({style: {left: '5px', top: '20px'}});
  animated.render(() => {
    animated.x = 10;
  });
  let p = new Promise((resolve, reject) => loop.once(() => {
    try {
      expect(options.elements.root).toEqual({style: {left: '10px', top: '20px'}});
      resolve();
    }
    catch (error) {
      reject(error);
    }
  }));
  await new Promise(resolve => setTimeout(resolve, 0));
  await p;
  expect(animated.begin).toEqual({position: {x: 5}});
  expect(animated.end).toEqual({position: {x: 10}});
  expect(options.elements.root).toEqual({style: {left: '5px', top: '20px'}});
});
