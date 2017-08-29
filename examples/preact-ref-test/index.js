import {h, render, Component} from 'preact';

const Content = ({data}) => {
  return <div ref={console.log.bind(console, 'content-top')}><div><div key="content" ref={console.log.bind(console, 'content')}>{JSON.stringify(data)}</div></div></div>;
};

class Body extends Component {
  constructor(...args) {
    super(...args);

    this.onClick = this.onClick.bind(this);

    this.state = {count: 0};
  }

  onClick() {
    this.setState({
      count: this.state.count + 1,
    });
  }

  render(props, state) {
    return <div key="div">
      <button key="button" onClick={this.onClick}>Change</button>
      <Content key="content" ref={console.log.bind(console, 'content-component')} data={state} />
    </div>;
  }
}

render(<Body />, document.getElementById('root'));
