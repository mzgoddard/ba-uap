import './source-map-support';

import TransitionTree from './transition-tree';

class Node {
  constructor(id, isElement) {
    this.id = id;
    this.isElement = isElement;
  }
}

Node.u = () => new Node();
Node.e = id => new Node(id, true);
Node.c = id => new Node(id, false);

class TestNodeIdGenerator {
  constructor() {
    this.isElement = this.isElement.bind(this);
    this.nodeId = this.nodeId.bind(this);
  }

  isElement(node) {
    return node.isElement;
  }

  nodeId(node) {
    return node.id;
  }
}

let tree;

beforeEach(() => {
  tree = new TransitionTree(new TestNodeIdGenerator());
});

it('get path returns list', () => {
  const branch = tree.get('root');
  expect(typeof branch.meta).toBe('function');
  expect(typeof branch.remove).toBe('function');
  expect(typeof branch.update).toBe('function');
  expect(typeof branch.missedNodes).toBe('function');
});

it('element id refers to parent list', () => {
  const branch = tree.get('root');
  const missed = [];
  branch.update([Node.e('first'), Node.e('second')], missed);
  expect(tree.element('first')).toBe(branch);
});

it('stores list', () => {
  const branch = tree.get('root');
  const missed = [];
  const first = Node.e('first');
  const second = Node.e('second');
  branch.update([first, second], missed);
  expect(branch.nodes['first']).toBe(first);
  branch.update([first, Node.e('second')], missed);
  expect(branch.nodes['second']).not.toBe(second);
  expect(branch.nodes['second']).toEqual(second);
});

it('updating sets list of missed items', () => {
  const branch = tree.get('root');
  const missed = [];
  branch.update([Node.e('first'), Node.e('second')], missed);
  branch.update([Node.e('second')], missed);
  expect(missed).toEqual(['first']);
});

it('inserts missing items into dest', () => {
  const branch = tree.get('root');
  const missed = [];
  const first = Node.e('first');
  branch.update([first, Node.e('second')], missed);
  branch.update([Node.e('second')], missed);
  const dest = [];
  branch.missedNodes(null, dest);
  expect(dest.length).toBe(2);
  expect(dest[0]).toBe(first);
});

it('removes items', () => {
  const branch = tree.get('root');
  const missed = [];
  branch.update([Node.e('first'), Node.e('second')], missed);
  branch.remove('first');
  branch.update([Node.e('second')], missed);
  expect(missed).toEqual([]);
});

it('removes item meta', () => {
  const branch = tree.get('root');
  const missed = [];
  branch.update([Node.e('first'), Node.e('second')], missed);
  branch.meta('first').isMeta = true;
  expect(branch._meta['first']).toEqual({isMeta: true});
  branch.remove('first');
  expect(branch._meta['first']).toBeFalsy();
});

it('removes child list', () => {
  const branch = tree.get('root');
  const missed = [];
  branch.update([Node.e('first'), Node.e('second')], missed);
  tree.get('root.first');
  branch.remove('first');
  expect(tree.lists['root.first']).toBeFalsy();
});

it('removes connection to parent list for elements', () => {
  const branch = tree.get('root');
  const missed = [];
  branch.update([Node.e('first'), Node.e('second')], missed);
  branch.remove('first');
  expect(tree.element('first')).toBeFalsy();
});

it('storing a list with a node missing an id clears the list', () => {
  const branch = tree.get('root');
  const missed = [];
  branch.update([Node.e('first'), Node.e('second')], missed);
  branch.update([Node.u()], missed);
  expect(missed.length).toBe(0);
  expect(branch.nodes['first']).toBeFalsy();
  // Update so branch can prime its order array
  branch.update([], missed);
  expect(branch.order.length).toBe(0);
});
