import {update, animate, present} from '../../src2/level0';

const animations = {
  spinnerIllusion: {
    default: {
      update: update.context(({
        object, elementArrays, constant, union, elements,
      }) => (
        union([
          elements({
            backA: object({
              opacity: constant(1),
            }),
            backB: object({
              opacity: constant(1),
            }),
          }),
          elementArrays({
            plusA: object({
              angle: constant(0),
              opacity: constant(1),
            }),
            plusB: object({
              angle: constant(0),
              opacity: constant(1),
            }),
          }),
        ])
      )),
      animate: animate.context(({
        object, array, constant, keyframes, seconds,
      }) => (
        object({
          backB: object({
            opacity: keyframes([
              seconds(1, constant(1)),
              seconds(0, constant(1)),
              seconds(1, constant(0)),
              seconds(0, constant(0)),
            ]),
          }),
          plusA: array(object({
            // angle: constant(0).to(constant(1)),
            angle: keyframes([
              seconds(1, constant(0)),
              seconds(1, constant(0.25)),
              seconds(0, constant(0.25)),
            ]),
            opacity: keyframes([
              seconds(1, constant(1)),
              seconds(0, constant(1)),
              seconds(1, constant(0)),
              seconds(0, constant(0)),
            ]),
          })),
          plusB: array(object({
            angle: keyframes([
              seconds(1, constant(0)),
              seconds(1, constant(0)),
              seconds(0, constant(-0.25)),
            ]),
            opacity: keyframes([
              seconds(1, constant(0)),
              seconds(0, constant(0)),
              seconds(1, constant(1)),
              seconds(0, constant(1)),
            ]),
          })),
        })
        .duration(4)
        .loop(4)
        .until(constant(0))
      )),
      present: present.context(({
        object, elementArrays, style, rotatez, key, constant, union, elements
      }) => (
        union([
          elements({
            backA: style({
              opacity: key('opacity'),
            }),
            backB: style({
              opacity: key('opacity'),
            }),
          }),
          elementArrays({
            plusA: style({
              transform: rotatez([key('angle').mul(constant(360)).deg()]),
              opacity: key('opacity'),
            }),
            plusB: style({
              transform: rotatez([key('angle').mul(constant(360)).deg()]),
              opacity: key('opacity'),
            }),
          }),
        ])
      )),
    },
  },
};

export default animations;
