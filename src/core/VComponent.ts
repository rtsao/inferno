import { Input, VComponent as VComponentType, isStatefulComponent } from '../shared';

export default class VComponent implements VComponentType {
	public _component: Function;
	public _dom: HTMLElement | Text = null;
	public _props: Object = null;
	public _hooks: Object = null;
	public _instance: Input = null;
	public _key: string | number = null;
	public _ref: string | number = null;
	public _isStateful: boolean;
	
	constructor(component: Function) {
		this._component = component;
		this._isStateful = isStatefulComponent(component);
	}
	key(key: string | number): VComponent {
		this._key = key;
		return this;
	}
	props(props: Object): VComponent {
		this._props = props;
		return this;
	}
	ref(ref: string | number): VComponent {
		this._ref = ref;
		return this;
	}
	hooks(hooks: Object): VComponent {
		this._hooks = hooks;
		return this;
	}
}