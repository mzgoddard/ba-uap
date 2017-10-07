import {update, animate, present} from '../../src2/level3/preact';

const animations = {
  tile: {
    'default': {
      update: update.context(({object, value, constant, property, rect}) => (
        rect().asElement(object({
          left: value(rect => rect.left + rect.width / 2),
          top: value(rect => rect.top + rect.height / 2),
          width: property('width'),
          height: property('height'),
          opacity: constant(1),
          duration: value(() => Math.random() * 0.5 + 0.5),
        }))
      )),
      animate: animate.context(({object, begin, end}) => {
        return object({
          left: begin().to(end()),
          top: begin().to(end()),
          width: begin().to(end()),
          height: begin().to(end()),
          opacity: begin().to(end()),
        })
        .duration(0.2)
        // .easing((t, state, begin, end) => t / end.duration);
        // .duration(3)
      }),
      present: present.context(({
        style, properties, concat, translate, key, end, constant, scale,
      }) => (
        style({
          visibility: constant('initial'),
          transform: concat([
            translate([key('left'), key('top')].map(k => k.to(end).px())),
            scale([key('width'), key('height')].map(k => k.over(end))),
          ]),
          opacity: key('opacity'),
        })
      )),
    },
    enter: {
      animate: animate.context(({object, begin, end, constant}) => {
        const ce = constant(0).to(end());
        return object({ width: ce, height: ce, opacity: ce })
        .duration(0.2)
        // .easing((t, state, begin, end) => t / end.duration);
        // .duration(3)
      }),
    },
    leave: {
      animate: animate.context(({object, begin, end, constant, value}) => {
        const be2 = begin().to(end());
        const bc = begin().to(constant(0));
        // return object({ width: be2, height: be2, opacity: bc })
        return object({ top: be2, left: be2, opacity: bc })
        .duration(0.2)
        // .easing((t, state, begin, end) => t / end.duration);
        // .duration(3)
      }),
    },
    newvalue: {
      animate: animate.context(({object, begin, end, keyframes, frame, seconds, value, constant}) => (
        object({
          top: begin().to(end()),
          left: begin().to(end()),
          width: value((t, state, begin, end) => end * (1 + 0.5 * (1 - t))),
          height: value((t, state, begin, end) => end * (1 + 0.5 * (1 - t))),
          // width: value((t, state, begin, end) => end * 1.3).to(end()),
          // height: value((t, state, begin, end) => end * 1.3).to(end()),
          // width: keyframes([
          //   frame(
          //     seconds(0.1),
          //     begin().to(value((t, state, begin, end) => (begin + end) / 2 * 1.2))
          //   ),
          //   frame(
          //     seconds(0.1),
          //     value((t, state, begin, end) => (begin + end) / 2 * 1.2).to(end())
          //   ),
          // ]),
          // height: keyframes([
          //   frame(
          //     seconds(0.1),
          //     begin().to(value((t, state, begin, end) => (begin + end) / 2 * 1.2))
          //   ),
          //   frame(
          //     seconds(0.1),
          //     value((t, state, begin, end) => (begin + end) / 2 * 1.2).to(end())
          //   ),
          // ]),
          opacity: begin().to(end()),
        })
        .duration(0.2)
      )),
      present: present.context(({
        style, concat, translate, key, end, constant, scale,
      }) => (
        style({
          visibility: constant('initial'),
          transform: concat([
            translate([key('left'), key('top')].map(k => k.to(end).px())),
            scale([key('width'), key('height')].map(k => k.over(end))),
          ]),
          opacity: key('opacity'),
          zIndex: constant(1),
        })
      )),
    },
  },
};

export default animations;
