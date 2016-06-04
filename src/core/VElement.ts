import { Input, VElement as VElementType, Hooks, Props } from '../shared';

export default class VElement implements VElementType {
	public _tag: string;
	public _dom: HTMLElement | SVGAElement | DocumentFragment = null;
	public _children: Input = null;
	public _key: string | number = null;
	public _props: Props = null;
	public _attrs: Object = null;
	public _events: Object = null;
	public _hooks: Hooks = null;
	public _text: string | number = null;
	public _ref: string | Function = null;
	public _isKeyed: boolean = false;
	
	constructor(tag: string) {
		this._tag = tag;
	}
	children(children: Input): VElement {
		this._children = children;
		return this;
	}
	props(props: Props): VElement {
		this._props = props;
		return this;
	}
	attrs(attrs: Object): VElement {
		this._attrs = attrs;
		return this;
	}
	hooks(hooks: Hooks): VElement {
		this._hooks = hooks;
		return this;
	}
	text(text: string | number): VElement {
		this._text = text;
		return this;
	}
	events(events: Object): VElement {
		this._events = events;
		return this;
	}
	key(key: string | number): VElement {
		this._key = key;
		return this;
	}
	keyed(keyed: boolean): VElement {
		this._isKeyed = keyed;
		return this;
	}
}