// {
//   update: (element, state, animated) => {state.rect = {left: element.getClientBoundingRect().left};};
//
//   animate: (t, state, begin, end) => {state.rect.left = (begin.rect.left - end.rect.left) * t;};
//
//   present: (state, element, store) => {element.styles.transform = `translate(${state}px)`;};
// }

// {
//   update: object({rect: object({left: rect(rect => rect.left)})}),
//   update: object({rect: rect(object({left: rect => rect.left}))}),
//
//   animate: object({rect: object({left: fromTo([at(0), at(1)])})}),
//
//   present: object({rect: styles({
//     transform: translate([
//       value(rect => rect.left).px(),
//       value(rect => rect.left).px(),
//     ]]),
//     transform: translate([key('left').px(), key('top').px()]]),
//     transform: translate([px(key('left')), px(key('top'))]]),
//     transform: translate(wrap(state => [state.left, state.top], [px, px])),
//   })}),
// }

// (t, state, begin, end) => {
//   state.rect.left = (begin.rect.left - end.rect.left) * t;
// }
