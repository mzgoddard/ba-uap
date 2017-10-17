import {update, animate, present} from '../../src2/level0';

const animations = {
  dotPlus: {
    default: {
      update: update.context(({object, elements, constant}) => (
        elements({
          dot: object({
            width: constant(0),
          }),
          pipe: object({
            height: constant(0),
            angle: constant(0),
          }),
          left: object({
            width: constant(0),
          }),
          right: object({
            width: constant(0),
          }),
        })
      )),
      animate: animate.context(({object, keyframes, percent, constant}) => (
        keyframes([
          percent(50, object({
            dot: object({
              width: constant(1.5),
            }),
            pipe: object({
              height: constant(0),
              angle: constant(0),
            }),
            left: object({
              width: constant(0),
            }),
            right: object({
              width: constant(0),
            }),
          })),
          percent(10, object({
            dot: object({
              width: constant(1.5),
            }),
            pipe: object({
              height: constant(0),
              angle: constant(0),
            }),
            left: object({
              width: constant(0),
            }),
            right: object({
              width: constant(0),
            }),
          })),
          percent(5, object({
            dot: object({
              width: constant(1),
            }),
            pipe: object({
              height: constant(0.8),
              angle: constant(0),
            }),
            left: object({
              width: constant(0),
            }),
            right: object({
              width: constant(0),
            }),
          })),
          percent(15, object({
            dot: object({
              width: constant(0.5),
            }),
            pipe: object({
              height: constant(1),
              angle: constant(22.5),
            }),
            left: object({
              width: constant(0),
            }),
            right: object({
              width: constant(0),
            }),
          })),
          percent(1, object({
            dot: object({
              width: constant(0.5),
            }),
            pipe: object({
              height: constant(1),
              angle: constant(90),
            }),
            left: object({
              width: constant(0),
            }),
            right: object({
              width: constant(0),
            }),
          })),
          percent(19, object({
            dot: object({
              width: constant(0.5),
            }),
            pipe: object({
              height: constant(1),
              angle: constant(90),
            }),
            left: object({
              width: constant(0),
            }),
            right: object({
              width: constant(1),
            }),
          })),
          percent(20, object({
            dot: object({
              width: constant(0.5),
            }),
            pipe: object({
              height: constant(1),
              angle: constant(180),
            }),
            left: object({
              width: constant(0),
            }),
            right: object({
              width: constant(1),
            }),
          })),
          percent(1, object({
            dot: object({
              width: constant(0.5),
            }),
            pipe: object({
              height: constant(1),
              angle: constant(270),
            }),
            left: object({
              width: constant(0),
            }),
            right: object({
              width: constant(1),
            }),
          })),
          percent(19, object({
            dot: object({
              width: constant(0.5),
            }),
            pipe: object({
              height: constant(1),
              angle: constant(270),
            }),
            left: object({
              width: constant(1),
            }),
            right: object({
              width: constant(1),
            }),
          })),
          percent(9, object({
            dot: object({
              width: constant(0.5),
            }),
            pipe: object({
              height: constant(1),
              angle: constant(360),
            }),
            left: object({
              width: constant(1),
            }),
            right: object({
              width: constant(1),
            }),
          })),
          percent(1, object({
            dot: object({
              width: constant(1.5),
            }),
            pipe: object({
              height: constant(0),
              angle: constant(360),
            }),
            left: object({
              width: constant(0),
            }),
            right: object({
              width: constant(0),
            }),
          })),
        ])
        .duration(2)
        .repeat(t => 0)
      )),
      present: present.context(({elements, style, scale, rotatez, concat, constant, key}) => (
        elements({
          dot: style({
            transform: scale([key('width')]),
          }),
          pipe: style({
            transform: concat([
              rotatez([key('angle').deg()]),
              constant(' '),
              scale([constant(1), key('height')])
            ]),
          }),
          left: style({
            transform: scale([key('width'), constant(1)]),
          }),
          right: style({
            transform: scale([key('width'), constant(1)]),
          }),
        })
      )),
    },
  },

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
