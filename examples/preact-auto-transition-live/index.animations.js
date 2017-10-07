import {update, animate, present} from '../../src2/level3/preact';

const animations = {
  icon: {
    'default': {
      update: update.context(({object, value, constant, property, rect}) => (
        rect().byElement(object({
          left: value(rect => rect.left + rect.width / 2),
          top: value(rect => rect.top + rect.height / 2),
          width: property('width'),
          height: property('height'),
          opacity: constant(1),
          duration: value(() => Math.random() * 0.5 + 0.5),
        }))
      )),
      animate: animate.context(({object, begin, end}) => {
        const be = begin().to(end());
        return object({ left: be, top: be, width: be, height: be, opacity: be })
        .duration(1)
        .easing((t, state, begin, end) => t / end.duration);
        // .duration(3)
      }),
      present: present.context(({styles, concat, translate, key, end, constant, scale}) => (
        styles({
          visibility: constant('initial'),
          transform: concat([
            translate([
              key('left').to(end).px(),
              key('top').to(end).px()
            ]),
            // translate([key('left'), key('top')].map(k => k.to(end).px())),
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
        .duration(1)
        .easing((t, state, begin, end) => t / end.duration);
        // .duration(3)
      }),
    },
    leave: {
      animate: animate.context(({object, begin, end, constant, value}) => {
        // const be2 = begin().to(value((t, state, begin, end) => end * 2));
        const bc = begin().to(constant(0));
        // return object({ width: be2, height: be2, opacity: bc })
        return object({ width: bc, height: bc, opacity: bc })
        .duration(1)
        .easing((t, state, begin, end) => t / end.duration);
        // .duration(3)
      }),
    },
  },
};

export default animations;
