import PropTypes from 'prop-types';
import React, {Children} from 'react';
import {TransitionGroup} from 'react-transition-group';
import {render, findDOMNode} from 'react-dom';

import {Animated, animate, update, present} from 'uap';

import './index.styl';

// const duration = (d, fn) => (t, state, begin, end) => {
//   // console.log(Math.min(1, t / d));
//   return fn(Math.min(1, t / d), state, begin, end);
// };

const delayDurationDelay = (d0, d1, d2, fn) => (t, state, begin, end) => {
  // console.log(Math.min(1, t / d));
  const d = d0 + d1;
  return fn(Math.max(0, Math.min(1, (t - d0) / d1)), state, begin, end);
};

const offset = (fn, offsetFn) => present.value((state, animated) => {
  return offsetFn(fn.value(state, animated), state, animated);
});

class RAnimatedStates extends React.Component {
  constructor(props) {
    super(props);

    this.animatedStates = {};
    this.animatedClaims = {};
  }

  getChildContext() {
    return {
      animatedStates: this,
    };
  }

  set(name, state) {
    this.animatedStates[name] = state;
  }

  get(name) {
    return this.animatedStates[name];
  }

  claim(name, cb) {
    if (this.animatedClaims[name]) {this.animatedClaims[name]();}
    this.animatedClaims[name] = cb;
    return () => {
      if (this.animatedClaims[name] === cb) {
        this.animatedClaims[name] = null;
      }
    };
  }

  render() {
    return Children.only(this.props.children);
  }
}

RAnimatedStates.childContextTypes = {
  animatedStates: PropTypes.object,
};

// class RAnimatedLayer extends React.Component {
//   constructor(props) {
//     super(props);
//
//     this.state = {exiting: []};
//     // this.checkExiting = this.checkExiting.bind(this);
//   }
//
//   getChildContext() {
//     return {
//       animatedExitLayer: this,
//     };
//   }
//
//   // componentDidMount() {
//   //   RunLoop.main.schedule(this.checkExiting, RunLoop.DESTROY);
//   // }
//
//   componentWillUnmount() {
//     // RunLoop.main.unschedule(this.checkExiting, RunLoop.DESTROY);
//     if (this.context.animatedExitLayer) {
//       for (let component of this.exiting) {
//         this.context.animatedExitLayer.add(component);
//       }
//     }
//   }
//
//   // add(component) {
//   //   const node = findDOMNode(this);
//   //   const componentNode = findDOMNode(component);
//   //   const exitRect = node.getBoundingClientRect();
//   //   const componentRect = componentNode.getBoundingClientRect();
//   //   const offsetNode = componentRect.offsetParent;
//   //   const offsetRect = componentRect.offsetParent.getBoundingClientRect();
//   //   let rect = {top: 0, left: 0};
//   //   if (componentNode.style.position === 'absolute') {
//   //     if (componentNode.style.top) {
//   //       rect.top = offsetRect.top - exitRect.top;
//   //     }
//   //     else {
//   //       rect.top = componentRect.top - exitRect.top;
//   //     }
//   //     if (componentNode.style.left) {
//   //       rect.left = offsetRect.left - exitRect.left;
//   //     }
//   //     else {
//   //       rect.left = componentRect.left - exitRect.left;
//   //     }
//   //   }
//   //   else {
//   //     if (componentNode.style.top) {
//   //       rect.top = offsetRect.top - exitRect.top;
//   //     }
//   //     else {
//   //       rect.top = componentRect.top - exitRect.top;
//   //     }
//   //     if (componentNode.style.left) {
//   //       rect.left = offsetRect.left - exitRect.left;
//   //     }
//   //     else {
//   //       rect.left = componentRect.left - exitRect.left;
//   //     }
//   //   }
//   //   this.setState({
//   //     exiting: this.state.exiting.concat([
//   //       React.createElement(
//   //         component.constructor,
//   //         component.props,
//   //         component.props.children,
//   //       ),
//   //     ]),
//   //   });
//   // }
//   //
//   // remove(component) {
//   //   const exiting = this.state.exiting.filter(({props}) => {
//   //     return props.name !== component.props.name;
//   //   });
//   //   if (exiting.length !== this.state.exiting.length) {
//   //     this.setState({exiting});
//   //   }
//   // }
//
//   render() {
//
//     // return (<div style="position: relative">
//     //   <div style="position: absolute; width: 100%; height: 100%; top: 0">{this.state.exiting}</div>
//     //   <div>{this.props.children}</div>
//     // </div>);
//   }
// }
//
// RAnimatedExitLayer.contextTypes = {
//   animatedExitLayer: PropTypes.object,
// };
//
// RAnimatedExitLayer.childContextTypes = {
//   animatedExitLayer: PropTypes.object,
// };

class RAnimated extends React.Component {
  constructor(props) {
    super(props);

    this.stage = 'init';

    this.elements = props.elements;
    if (props.update && props.animate && props.present) {
      const animatedProps = Object.assign({}, props);
      const _willAnimate = props.willAnimate;
      const willAnimate = animatedProps.willAnimate = () => {
        if (this.stage === 'ready') {
          this.stage = 'animating';
        }
        if (_willAnimate) {
          _willAnimate();
        }
      };
      const _didAnimate = props.didAnimate;
      const didAnimate = animatedProps.didAnimate = () => {
        if (this.stage === 'animating') {
          // this.animated.update(this.animated.elements.root.element, this.animated.state, this.animated);
          this.stage = 'ready';
        }
        if (_didAnimate) {
          _didAnimate();
        }
      };
      this.animated = new Animated(animatedProps);
    }
    else {
      this.animated = null;
    }
    this.animatedChildren = [];

    this._lostClaim = false;
    this._dropClaim = null;
  }

  getChildContext() {
    return {
      animatedParent: this,
    };
  }

  componentWillReceiveProps(newProps) {
    this.elements = newProps.elements;
    if (this.animated) {
      // console.log('componentWillReceiveProps');
      const animatedProps = Object.assign({}, newProps);
      if (this.animated.update !== this.props.update) {
        animatedProps.update = this.animated.update;
      }
      if (this.animated.animate !== this.props.animate) {
        animatedProps.animate = this.animated.animate;
      }
      if (this.animated.present !== this.props.present) {
        animatedProps.present = this.animated.present;
      }
      Object.assign(this.animated, animatedProps, {elements: this.animated.elements});
    }
  }

  componentDidMount() {
    if (this.context.animatedParent) {
      this.context.animatedParent.addChild(this);
    }

    if (!this.animated) {return;}

    // console.log('componentDidMount');

    this._dropClaim = this.context.animatedStates.claim(this.props.name, () => {
      // console.log('lostClaim', this.props.name);
      this._lostClaim = true;
      findDOMNode(this).style.visibility = 'hidden';
      if (this.stage !== 'left') {
        // if (this.stage === 'ready') {
        //   this.animated.update(this.animated.elements.root.element, this.animated.state, this.animated);
        // }
        this.context.animatedStates.set(this.props.name, this.animated.animate.clone(this.animated.state));
      }
      else {
        this.context.animatedStates.set(this.props.name, null);
      }
      this.animated.destroy();
      // Promise.resolve().then(() => {debugger;});
    });
    // console.log('claim', this.props.name);

    this.updateElements();
    const begin = this.context.animatedStates.get(this.props.name);
    if (begin) {
      if (this.stage === 'init') {
        this.stage = 'soft-enter';
      }
      const _didAnimate = this.animated.options.didAnimate;
      const didAnimate = this.animated.options.didAnimate = () => {
        if (this.stage === 'soft-enter') {
          this.stage = 'ready';
        }
        if (this.animated.options.didAnimate === didAnimate) {
          this.animated.options.didAnimate = _didAnimate;
          if (_didAnimate) {
            _didAnimate();
          }
        }
      };
      // console.log('continue', begin);
      this.animated.continueRender(begin);
    }
    else {
      // this.animated.firstRender();
    }

    if (this.stage === 'init') {
      this.stage = 'ready';
    }
  }

  componentWillUnmount() {
    if (this.context.animatedParent) {
      this.context.animatedParent.removeChild(this);
    }

    if (!this.animated) {return;}

    if (!this._lostClaim) {
      if (this.stage !== 'left') {
        this.context.animatedStates.set(this.props.name, this.animated.animate.clone(this.animated.state));
      }
      else {
        this.context.animatedStates.set(this.props.name, null);
      }
      this._dropClaim();
      this.animated.destroy();
    }
  }

  componentWillUpdate() {
    if (!this._lostClaim && this.animated) {
      // console.log('componentWillUpdate', this.stage);
      // if (!this.animated._firstRender) {
      this.animated.willRender();
      // }
      // console.log(this.stage);
      if (this.stage === 'ready') {
        // this.animated.update(this.animated.elements.root.element, this.animated.state, this.animated);
      }
    }
  }

  componentDidUpdate() {
    if (!this._lostClaim && this.animated) {
      // console.log('componentDidUpdate');
      this.updateElements();
      this.animated.didRenderSoon();
      // Promise.resolve().then(() => {debugger;});
    }
  }

  __componentWillEnter() {
    if (this._lostClaim) {
      return Promise.resolve();
    }
    if (!this.animated) {
      return Promise.resolve();
    }
    if (this.context.animatedStates.get(this.props.name)) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      if (this.props.updateEnter || this.props.animateEnter) {
        const update = this.props.updateEnter || this.animated.update;
        const animate = this.animated.animate;
        if (this.props.animateEnter) {
          this.animated.animate = this.props.animateEnter;
        }
        const present = this.animated.present;
        const presentEnter = this.props.presentEnter;
        if (presentEnter) {
          // console.log('presentEnter');
          this.animated.present = presentEnter;
        }
        const _didAnimate = this.animated.options.didAnimate;
        const didAnimate = this.animated.options.didAnimate = () => {
          if (this.stage === 'enter') {
            this.stage = 'ready';
          }
          resolve();
          if (this.animated.animate === this.props.animateEnter) {
            this.animated.animate = this.props.animate;
          }
          if (this.animated.present === presentEnter) {
            this.animated.present = this.props.present;
          }
          if (this.animated.options.didAnimate === didAnimate) {
            this.animated.options.didAnimate = _didAnimate;
          }
          if (_didAnimate) {
            _didAnimate();
          }
        };

        if (!this.animated._firstRender) {
          this.animated.render(() => {
            if (this.stage === 'ready') {
              update(this.animated.elements.root.element, this.animated.state, this.animated);
            }
            if (this.stage === 'ready') {
              this.stage = 'enter';
            }
          });
        }
        else {
          if (this.stage === 'ready') {
            this.stage = 'enter';
          }
          update(this.animated.elements.root.element, this.animated.state, this.animated);
          // console.log('__componentWillEnter begin', this.animated.begin);
          this.animated.continueRender(this.animated.state);
        }
      }
      else {
        resolve();
      }
    });
  }

  _componentWillEnter() {
    return Promise.all(
      [this.__componentWillEnter()]
      .concat(this.animatedChildren.map(child => child._componentWillEnter()))
    );
  }

  componentWillEnter(cb) {
    this._componentWillEnter()
    .then(cb, cb);
  }

  __componentWillLeave() {
    if (this._lostClaim) {
      return Promise.resolve();
    }
    if (!this.animated) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      if (this.props.updateLeave || this.props.animateLeave) {
        const update = this.animated.update;
        if (this.props.updateLeave) {
          this.animated.update = this.props.updateLeave;
        }
        const animate = this.animated.animate;
        if (this.props.animateLeave) {
          this.animated.animate = this.props.animateLeave;
        }
        const present = this.animated.present;
        if (this.props.presentLeave) {
          this.animated.present = this.props.presentLeave;
        }
        const _didAnimate = this.animated.options.didAnimate;
        const didAnimate = this.animated.options.didAnimate = () => {
          this.stage = 'left';
          resolve();
          if (this.animated.update === this.props.updateLeave) {
            this.animated.update = this.props.update;
          }
          if (this.animated.animate === this.props.animateLeave) {
            this.animated.animate = this.props.animate;
          }
          if (this.animated.present === this.props.presentLeave) {
            this.animated.present = this.props.present;
          }
          if (this.animated.options.didAnimate === didAnimate) {
            this.animated.options.didAnimate = _didAnimate;
          }
          if (_didAnimate) {
            _didAnimate();
          }
        };

        this.animated.render(() => {
          if (this.stage === 'ready') {
            update(this.animated.elements.root.element, this.animated.state, this.animated);
          }
          this.stage = 'leave';
        });
      }
      else {
        resolve();
      }
    });
  }

  _componentWillLeave() {
    return Promise.all(
      [this.__componentWillLeave()]
      .concat(this.animatedChildren.map(child => child._componentWillLeave()))
    );
  }

  componentWillLeave(cb) {
    this._componentWillLeave()
    .then(cb, cb);
  }

  addChild(child) {
    this.animatedChildren.push(child);
  }

  removeChild(child) {
    const index = this.animatedChildren.indexOf(child);
    this.animatedChildren.splice(index, 1);
  }

  updateElements() {
    if (this.elements) {
      for (let [key, value] of Object.entries(this.elements)) {
        if (key === 'root' && value === 'root') {
          this.animated.elements[key].element = findDOMNode(this);
        }
        else {
          this.animated.elements[key].element = findDOMNode(this).querySelector(value);
        }
      }
    }
  }

  render() {
    if (this.stage === 'ready') {
      this.animated.update(this.animated.elements.root.element, this.animated.state, this.animated);
    }
    return Children.only(this.props.children);
  }
}

RAnimated.contextTypes = {
  animatedStates: PropTypes.object,
  animatedParent: PropTypes.object,
};

RAnimated.childContextTypes = {
  animatedParent: PropTypes.object,
};

const Page1Item = ({img, name, onClick}) => (
  <RAnimated name={name}
    elements={{root: 'root'}}
    update={update.object({
      x: element => element.getBoundingClientRect().left,
      y: element => element.getBoundingClientRect().top,
      width: element => element.getBoundingClientRect().width,
      height: element => element.getBoundingClientRect().height,
      opacity: () => 1,
    })}
    updateEnter={update.object({
      x: element => element.getBoundingClientRect().left,
      y: element => element.getBoundingClientRect().top,
      width: element => element.getBoundingClientRect().width,
      height: element => element.getBoundingClientRect().height,
      opacity: () => 0,
    })}
    updateLeave={update.object({
      x: element => element.getBoundingClientRect().left,
      y: element => element.getBoundingClientRect().top,
      width: element => element.getBoundingClientRect().width,
      height: element => element.getBoundingClientRect().height,
      opacity: () => 0,
    })}
    animate={animate.duration(0.3, animate.object({
      x: animate.begin().to(animate.end()),
      y: animate.begin().to(animate.end()),
      width: animate.begin().to(animate.end()),
      height: animate.begin().to(animate.end()),
      opacity: animate.begin().to(animate.end()),
    }))}
    present={present.styles({
      transform: present.concat([
        present.translate([
          present.key('x').sub(present.key('x').end())
          .sub(
            present.key('width').end()
            .sub(present.key('width'))
            .div(present.constant(2))
          ).px(),
          present.key('y').sub(present.key('y').end())
          .sub(
            present.key('width').end()
            .sub(present.key('width'))
            .div(present.constant(2))
          ).px(),
        ]),
        () => ' ',
        present.scale([
          present.key('width').div(present.key('width').end()),
        ]),
        // () => ' ',
        // present.scale([
        //   present.value(state => 1 - (0.5 - state.opacity / 2)),
        // ]),
      ]),
      opacity: present.key('opacity'),
    })}
    presentEnter={present.styles({
      transform: present.concat([
        present.translate([
          present.key('x').sub(present.key('x').end())
          .sub(
            present.key('width').end()
            .sub(present.key('width'))
            .div(present.constant(2))
          ).px(),
          present.key('y').sub(present.key('y').end())
          .sub(
            present.key('width').end()
            .sub(present.key('width'))
            .div(present.constant(2))
          ).px(),
        ]),
        () => ' ',
        present.scale([
          present.value(state => 1 - (0.5 - state.opacity / 2)),
        ]),
      ]),
      opacity: present.key('opacity'),
    })}
    presentLeave={present.styles({
      transform: present.concat([
        present.translate([
          present.key('x').sub(present.key('x').end())
          .sub(
            present.key('width').end()
            .sub(present.key('width'))
            .div(present.constant(2))
          ).px(),
          present.key('y').sub(present.key('y').end())
          .sub(
            present.key('width').end()
            .sub(present.key('width'))
            .div(present.constant(2))
          ).px(),
        ]),
        () => ' ',
        present.scale([
          present.value(state => 1 - (0.5 - state.opacity / 2)),
        ]),
      ]),
      opacity: present.key('opacity'),
    })}>
    <div className="root" onClick={onClick}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '90px', height: '90px',
        margin: '5px',
      }}>
      <img width="90" height="90" src={img} />
    </div>
  </RAnimated>
);

const itemImgs = {
  a: require('./discord.svg'),
  b: require('./docker.svg'),
  c: require('./git.svg'),
  d: require('./github.svg'),
  e: require('./gitter.svg'),
  f: require('./javascript.svg'),
  g: require('./nintendoswitch.svg'),
  h: require('./nodejs.svg'),
  i: require('./raspberrypi.svg'),
  j: require('./react.svg'),
  k: require('./500px.svg'),
  l: require('./jekyll.svg'),
  m: require('./minecraft.svg'),
  n: require('./slack.svg'),
  o: require('./stripe.svg'),
  p: require('./travisci.svg'),
}

const Page1 = ({names, select, shuffle}) => (
  <TransitionGroup component="div" style={{width: '500px', maxWidth: '100vw', position: 'absolute', top: '0', left: '0'}}>
    {names.map(name => (
      <RAnimated key={name}>
        <Page1Item
          name={name}
          onClick={() => select(name)}
          img={itemImgs[name]} />
      </RAnimated>
    ))}
  </TransitionGroup>
);

const ShuffleLayer = ({names, shuffle}) => (
  <div style={{width: '500px', maxWidth: '100vw', position: 'absolute', top: '0', left: '0'}}>
    {names.map(name => <div key={name} style={{display: 'inline-block', width: '90px', height: '90px', margin: '5px'}} />)}
    <div onClick={shuffle} style={{position: 'relative', userSelect: 'none'}}>Shuffle</div>
  </div>
);

const Page2 = ({name, onBack}) => (
  <div style={{position: 'absolute', top: 0}}>
  <div onClick={onBack}>Back</div>
  <RAnimated name={name}
    elements={{root: 'root'}}
    update={update.object({
      x: element => element.getBoundingClientRect().left,
      y: element => element.getBoundingClientRect().top,
      width: element => element.getBoundingClientRect().width,
      height: element => element.getBoundingClientRect().height,
      opacity: () => 1,
    })}
    // updateEnter={update.object({
    //   x: element => element.getBoundingClientRect().left + 50,
    //   y: element => element.getBoundingClientRect().top + 50,
    // })}
    updateLeave={update.object({
      x: element => element.getBoundingClientRect().left + 50,
      y: element => element.getBoundingClientRect().top + 50,
      width: element => element.getBoundingClientRect().width,
      height: element => element.getBoundingClientRect().height,
      opacity: () => 0,
    })}
    animate={animate.duration(0.3, animate.object({
      x: animate.begin().to(animate.end()),
      y: animate.begin().to(animate.end()),
      width: animate.begin().to(animate.end()),
      height: animate.begin().to(animate.end()),
      opacity: animate.begin().to(animate.end()),
    }))}
    present={present.styles({
      transform: present.concat([
        present.translate([
          present.key('x').sub(present.key('x').end())
          .sub(
            present.key('width').end()
            .sub(present.key('width'))
            .div(present.constant(2))
          ).px(),
          present.key('y').sub(present.key('y').end())
          .sub(
            present.key('width').end()
            .sub(present.key('width'))
            .div(present.constant(2))
          ).px(),
        ]),
        () => ' ',
        present.scale([
          present.key('width').div(present.key('width').end()),
        ]),
      ]),
      opacity: present.key('opacity'),
    })}>
    <div className="root"
      style={{position: 'relative', width: '200px', height: '200px'}}>
      <img src={itemImgs[name]} />
    </div>
  </RAnimated>
  </div>
);

class App extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      names: [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
      ],
      page: 0,
      item: '',
    };
  }

  render() {
    const shuffle = () => {
      // console.log('shuffle');
      const names = this.state.names.slice();
      names.sort(() => Math.random() - 0.5);
      this.setState({names});
    };
    return (
      <div>
      <RAnimatedStates>
        <TransitionGroup style={{position: 'relative'}}>
          {this.state.page == 0 ?
            <RAnimated key="shuffle">
              <ShuffleLayer
                names={this.state.names.slice(0, 10)}
                shuffle={shuffle} />
            </RAnimated> :
            <RAnimated key="shuffle_space"><span></span></RAnimated>
          }
          {this.state.page == 0 ?
            <RAnimated key={Math.random()}>
              <Page1
                select={name => this.setState({page: 1, item: name})}
                names={this.state.names.slice(0, 10)} />
            </RAnimated> :
            <RAnimated key="page2">
              <Page2 name={this.state.item}
                onBack={() => this.setState({page: 0})} />
            </RAnimated>
          }
        </TransitionGroup>
      </RAnimatedStates>
      </div>
    );
  }
}

render(<App />, document.querySelector('#root'));
