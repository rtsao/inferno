import { StatefulComponent, Input, Props } from '../shared';

const noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';

export default class Component implements StatefulComponent {
	public props: Props;
	public state: Object = {};
	public refs: Object = {};
	public _blockSetState: boolean = false;
	public _deferSetState: boolean = false;
	public _pendingSetState: boolean = false;
	public _pendingState: Object = {};
	public _lastInput: Input = null;
	public _unmounted: boolean = true;
	public context: Object = {};
	public _patch: Function = null;
	
	constructor(props) {
		this.props = props || {};
	}
	getChildContext() {}
	_mountComponent() {

	}
	_patchCmponent() {

	}
	render() {
		throw new Error('Inferno Error: Component is missing a "render" method. This is a mandatory InfernoComponent method.');
	}
	componentWillMount() {}
	componentDidMount() {}
	componentWillUnmount() {}
	componentWillUpdate() {}
	componentDidUpdate() {}
	componentShouldUpdate() {
		return true;
	}
}