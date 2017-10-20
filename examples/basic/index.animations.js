import {update, animate, present} from '../../src2/level0';

const animations = {
  box: {
    default: {
      update: update.context(({
        object,
      }) => (
        object({})
      )),
      animate: animate.context(({
        object,
      }) => (
        object({})
      )),
      present: present.context(({
        style,
      }) => (
        style({})
      )),
    },
  },
};

export default animations;
