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
          percent(0, object({
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
          percent(20, object({
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
          percent(0, object({
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
          percent(20, object({
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
          percent(10, object({
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
          percent(0, object({
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
        .loop(2)
        .until(t => 0)
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
};

export default animations;
