import { StatefulComponent, Input, Props, Refs, State, PendingState, isUndef, VElement, VComponent, VTemplate, isNull, isArray, isTrue } from '../shared';
import { getActiveNode, resetActiveNode, normaliseInput } from '../DOM/shared';
import Lifecycle from '../DOM/Lifecycle';
import { invalidInput } from '../DOM/patching'

const noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';

function applyState(component: StatefulComponent, force: boolean, callback: Function) {
	if (isTrue(component._unmounted)) {
		return;
	}
	if (!component._deferSetState || force) {
		component._pendingSetState = false;
		const pendingState = component._pendingState;
		const oldState = component.state;
		const props = component.props;
		const nextState = Object.assign({}, oldState, pendingState);
		const shouldUpdate = component.shouldComponentUpdate(props, nextState);
		
		component._pendingState = {};
		if (isTrue(shouldUpdate) || force) { 
			const activeNode = getActiveNode();
			const lastInput = component._lastInput;
			const parentDom = (lastInput as VElement | VComponent | VTemplate)._dom.parentNode;
			const subLifecycle = new Lifecycle((lastInput as VElement | VTemplate)._dom);
			let nextInput = component._patchComponent(lastInput, parentDom, oldState, nextState, props, props, subLifecycle, component, null, null, false, component.context);
			
			component._lastInput = nextInput;
			subLifecycle.trigger();
			if (!isUndef(callback)) {
				callback();
			}
			resetActiveNode(activeNode);
		}
	}
}

function queueStateChanges(component: StatefulComponent, newState: State, callback: Function) {
	for (let stateKey in newState) {
		component._pendingState[stateKey] = newState[stateKey];
	}
	if (!component._pendingSetState) {
		component._pendingSetState = true;
		applyState(component, false, callback);
	} else {
		const pendingState = component._pendingState;
		const oldState = component.state;

		component.state = Object.assign({}, oldState, pendingState);
		component._pendingState = {};
	}
}

export default class Component implements StatefulComponent {
	public props: Props;
	public state: State = {};
	public refs: Refs = {};
	public _blockSetState: boolean = false;
	public _deferSetState: boolean = false;
	public _pendingSetState: boolean = false;
	public _pendingState: PendingState = {};
	public _lastInput: Input = null;
	public _unmounted: boolean = true;
	public context: Object = {};
	public _patch: Function = null;
	
	constructor(props) {
		this.props = props || {};
	}
	forceUpdate(callback): void {
		if (this._unmounted) {
			throw Error(noOp);
		}
		applyState(this, true, callback);
	}
	setState(nextState: State, callback?: Function): void {
		if (this._unmounted) {
			throw Error(noOp);
		}
		if (this._blockSetState === false) {
			queueStateChanges(this, nextState, callback);
		} else {
			throw Error('Inferno Warning: Cannot update state via setState() in componentWillUpdate()');
		}
	}
	getChildContext(): void {}
	_mountComponent(): void {
		// TODO move logic from mount to here
	}
	_patchComponent(
		lastInput: Input, 
		parentDomNode: HTMLElement | DocumentFragment | SVGAElement, 
		lastState: Object, 
		nextState: Object, 
		lastProps: Props,
		nextProps: Props, 
		lifecycle: Lifecycle, 
		lastInstance: StatefulComponent, 
		namespace: string, 
		isKeyed: boolean, 
		isRoot: boolean, 
		context: Object
	): Input {
		const childContext = this.getChildContext();

		if (!isNull(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		this._blockSetState = true;
		this.componentWillUpdate(nextProps, nextState);
		this._blockSetState = false;
		this.props = nextProps || {};
		this.state = nextState;
		const nextInput = normaliseInput(this.render() as any);

		if (isArray(nextInput)) {
			throw new Error(invalidInput);
		}
		this._patch(lastInput, nextInput, parentDomNode, lifecycle, lastInstance, namespace, isKeyed, isRoot, context);
		this.componentDidUpdate(lastProps, lastState);
		return nextInput;
	}
	render(): void {
		throw new Error('Inferno Error: Component is missing a "render" method. This is a mandatory InfernoComponent method.');
	}
	componentWillMount(): void {}
	componentDidMount(): void {}
	componentWillUnmount(): void {}
	componentWillUpdate(lastProps: Props, nextState: Object): void {}
	componentDidUpdate(lastProps: Props, lastState: Object): void {}
	shouldComponentUpdate(nextProps: Props, nextState: Object): boolean {
		return true;
	}
}