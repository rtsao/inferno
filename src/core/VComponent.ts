import { Input, VComponent as VComponentType, isStatefulComponent, Hooks, StatefulComponent, Props } from '../shared';

export default class VComponent implements VComponentType {
	public _component: Function;
	public _dom: HTMLElement | SVGAElement | DocumentFragment = null;
	public _props: Props = null;
	public _hooks: Hooks = null;
	public _instance: StatefulComponent | Input = null;
	public _key: string | number = null;
	public _ref: string | Function = null;
	public _isStateful: boolean;
	
	constructor(component: Function) {
		this._component = component;
		this._isStateful = isStatefulComponent(component);
	}
	key(key: string | number): VComponent {
		this._key = key;
		return this;
	}
	props(props: Props): VComponent {
		this._props = props;
		return this;
	}
	ref(ref: string | Function): VComponent {
		this._ref = ref;
		return this;
	}
	hooks(hooks: Hooks): VComponent {
		this._hooks = hooks;
		return this;
	}
}