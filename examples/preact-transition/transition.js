import {cloneElement, Component} from 'preact';

import Transition from '../../src/transition';
import AnimatedState from '../../src/animated-state';

class PreactTransition extends Component {
  constructor(...args) {
    super(...args);

    this.transition = null;

    this.lostClaim = false;
    this.claims = {};
    this.elements = {};
    this.children = {};
    this._dropPromise = null;
    this.dropped = new Promise(resolve => {
      this._dropPromise = resolve;
    });
  }

  getChildContext() {
    return {
      parentTransition: this,
    };
  }

  get parentTransition() {
    return this.context && this.context.parentTransition;
  }

  get rootTransition() {
    let parent = this.parentTransition;
    while (parent && parent.parentTransition) {
      parent = parent.parentTransition;
    }
    return parent;
  }

  _initTransition() {
    if (!this.transition) {
      const root = this.rootTransition;
      let state = null;
      if (root) {
        state = root.claim(this.props.animatedKey, () => {
          console.log('lost claim', this.props.animatedKey);
          this.lostClaim = true;
          this._dropPromise();
          this.parentTransition.removeChild(this.props.animatedKey);
          if (this.base) {
            this.base.style.visibility = 'hidden';
          }
          const state = this.transition.state;
          this.transition.destroy();
          this.transition = null;
          return state;
        });
        this.lostClaim = false;
        console.log('claimed?', state, this.base);

        this.parentTransition.addChild(this.props.animatedKey, this);
      }
      if (!state) {
        // console.log('new state');
        state = new AnimatedState(this.props.animations || {});
      }
      this.transition = new Transition(state, this.elements);
      this.transition.debugId = this.props.animatedKey;
    }
    if (this.transition && this.base) {
      this.base.style.visibility = '';
    }
  }

  componentDidMount() {
    console.log('mount', this.props.animatedKey);
    this._initTransition();
  }

  componentWillUnmount() {
    console.log('unmount', this.props.animatedKey);
    if (!this.lostClaim) {
      const root = this.rootTransition;
      if (root) {
        // console.log('drop', this.props.animatedKey);
        root.drop(this.props.animatedKey);
        this.transition.destroy();
        this.transition = null;
        this.parentTransition.removeChild(this.props.animatedKey);
      }
    }
  }

  _componentWillTransition(method, event) {
    console.log('_componentWillTransition', method, this.props.animatedKey, !!this.transition)
    const promises = [this.transition && this.transition[method]()]
    .concat(
      Object.values(this.children)
      .map(child => child && child[event]())
    );
    return Promise.race([Promise.all(promises), this.dropped]);
  }

  componentWillAppear(cb) {
    // console.log(arguments);
    console.log('transition appear', this.props.animatedKey);
    this._initTransition();
    return this._componentWillTransition('appear', 'componentWillAppear')
    .then(() => console.log('transition appeared', this.props.animatedKey))
    .then(() => cb && cb());
  }

  componentWillEnter(cb) {
    console.log('transition enter', this.props.animatedKey);
    this._initTransition();
    return Promise.resolve()
    .then(() => this._componentWillTransition('enter', 'componentWillEnter'))
    .then(() => console.log('transition entered', this.props.animatedKey, this.transition.state.data.state.left))
    .then(() => cb && cb());
  }

  componentWillLeave(cb) {
    console.log('transition leave', this.props.animatedKey);
    return Promise.resolve()
    .then(() => this._componentWillTransition('leave', 'componentWillLeave'))
    .then(() => console.log('transition left', this.props.animatedKey))
    .then(() => cb && cb());
  }

  componentWillUpdate() {
    this._initTransition();
    this.transition.state.restore();
  }

  componentDidUpdate() {
    this._initTransition();
    this.transition.state.loop.soon()
    .then(() => {
      if (!this.transition) {return;}
      console.log('transition update', this.props.animatedKey, this.transition.state.state.substate);
      this.transition.state.restart();
      this.transition.state.store();
      this.transition.update();
    });
  }

  claim(key, release) {
    console.log('claim', key, this.claims[key], this.props.animatedKey);
    let state = null;
    if (this.claims[key]) {
      state = this.claims[key]();
    }
    this.claims[key] = release;
    return state;
  }

  drop(key) {
    this.claims[key] = null;
  }

  addChild(key, child) {
    this.children[key] = child;
  }

  removeChild(key) {
    this.children[key] = null;
  }

  addElement(name, el) {
    if (!el) {return;}
    if (el instanceof Element) {
      this.elements[name] = {
        element: el,
      };
    }
    else {
      // console.log(el);
      this.elements[name] = {
        component: el,
        get element() {
          return this.component.base;
        },
      };
    }
  }

  render({children}) {
    const ref = el => {
      if (children[0].ref) {
        children[0].ref(el);
      }
      this.addElement('root', el);
    }
    return cloneElement(children[0], {
      ref,
    });
  }
}

export default PreactTransition;
