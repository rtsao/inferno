export type Input = string | number | VElement | VTextNode | VComponent | VTemplate | Array<string | number | VElement | VTextNode | VComponent | VTemplate | Array<any>>;

export interface VElement {
	_tag: string,
	_children: Input | Array<any>,
	_dom: HTMLElement | Text,
	_key: string | number,
	_props: Object,
	_attrs: Object,
	_events: Object,
	_hooks: Object,
	_text: string | number,
	_ref: string | number,
	_isKeyed: boolean
}

export interface VTextNode {
	_text: string,
	_dom: Text,
	_key: string | number,
	_t: boolean
}

export interface VComponent {
	_component: Function,
	_dom: HTMLElement | Text,
	_props: Object,
	_hooks: Object,
	_key: string | number
	_instance: Input,
	_ref: string | number,
	_isStateful: boolean
}

export interface VTemplate {
	_dom: HTMLElement | Text,
	_key: string | number,
	bp: Blueprint,
	v0: Input,
	v1: Array<Input>
}

export interface Blueprint {
	_keyIndex: number,
	mount: Function,
	patch: Function,
	unmount: Function,
	pools: Object,
	schemaFunc: Function
}

export const isServer = typeof document === 'undefined' ? true : false;

export function isVComponent(obj: any): obj is VComponent {
	return !isUndef(obj._component);
}

export function isVElement(obj: any): obj is VElement {
	return !isUndef(obj._tag);
}

export function isUndef(obj: any): boolean {
	return obj === undefined;
}

export function isNullOrUndef(obj: any): boolean {
	return isUndef(obj) || isNull(obj);
}

export function isNull(obj: any): boolean {
	return obj === null;
}

export function isInvalid(obj: any): boolean {
	return isUndef(obj) || isNull(obj) || isTrue(obj) || isFalse(obj);
}

export function isArray(obj: any): boolean {
	return Array.isArray(obj);
}

export function isPromise(obj: any): boolean {
	return obj instanceof Promise;
}

export function isObject(obj: any): boolean {
	return typeof obj === 'object';
}

export function isString(obj: any): boolean {
	return typeof obj === 'string';
}

export function isNumber(obj: any): boolean {
	return typeof obj === 'number';
}

export function isFunction(obj): boolean {
	return typeof obj === 'function';
}

export function isFalse(obj: any): boolean {
	return obj === false;
}

export function isTrue(obj: any): boolean {
	return obj === true;
}

export function isStringOrNumber(obj: any): boolean {
	return isString(obj) || isNumber(obj);
}

export function isStatefulComponent(obj): boolean {
	return !isUndef(obj.prototype) && obj.prototype.render !== undefined;
}
