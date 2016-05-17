export type VNode = VElement | VTextNode | VComponent | VTemplate | VAsyncNode | VEmptyNode;
export type Input = string | number | VNode | Promise<any> | Array<string | number | VNode | Promise<any> | Array<any>>;

export interface StatefulComponent {
	refs: Object
}

export interface VElement {
	_tag: string,
	_children: Input | Array<any>,
	_dom: HTMLElement | SVGAElement | DocumentFragment,
	_key: string | number,
	_props: Object,
	_attrs: Object,
	_events: Object,
	_hooks: Hooks,
	_text: string | number,
	_ref: string | Function,
	_isKeyed: boolean
}

export interface VTextNode {
	_text: string | number,
	_dom: Text,
	_key: string | number,
	_t
}

export interface VComponent {
	_component: Function,
	_dom: HTMLElement | SVGAElement | DocumentFragment,
	_props: Object,
	_hooks: Object,
	_key: string | number
	_instance: Input,
	_ref: string | number,
	_isStateful: boolean
}

export interface VTemplate {
	_dom: HTMLElement | SVGAElement | DocumentFragment,
	_key: string | number,
	bp: Blueprint,
	v0: Input,
	v1: Array<Input>
}

export interface VAsyncNode {
	_dom: HTMLElement | SVGAElement | DocumentFragment | Text,
	_key: string | number,
	_async: Promise<any>,
	_cancel: boolean,
	_lastInput: Input
}

export interface VEmptyNode {
	_dom: Text,
	_key: string | number,
	_e
}

export interface Blueprint {
	_keyIndex: number,
	mount: Function,
	patch: Function,
	unmount: Function,
	pools: Object,
	schemaFunc: Function
}

export interface Hooks {
	created: Function,
	attached: Function,
	willDetach: Function,
	detached: Function
}

export interface Root {
	input: Input
}

export const isServer = typeof document === 'undefined' ? true : false;

export function isVEmptyNode(obj: any): obj is VEmptyNode {
	return !isUndef(obj._e);
}

export function isVComponent(obj: any): obj is VComponent {
	return !isUndef(obj._component);
}

export function isVAsyncNode(obj: any): obj is VAsyncNode {
	return !isUndef(obj._async);
}

export function isVNode(obj: any): obj is VNode {
	return !isUndef(obj._dom);
}

export function isVElement(obj: any): obj is VElement {
	return !isUndef(obj._tag);
}

export function isVTemplate(obj: any): obj is VTemplate {
	return !isUndef(obj.bp);
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
	return isUndef(obj) || isNull(obj) || isFalse(obj);
}

export function isArray(obj: any): obj is Array<any> {
	return Array.isArray(obj);
}

export function isPromise(obj: any): obj is Promise<any> {
	return !isUndef(obj.then);
}

export function isObject(obj: any): obj is Object {
	return typeof obj === 'object';
}

export function isString(obj: any): obj is string {
	return typeof obj === 'string';
}

export function isNumber(obj: any): obj is number {
	return typeof obj === 'number';
}

export function isFunction(obj): obj is Function {
	return typeof obj === 'function';
}

export function isFalse(obj: any): boolean {
	return obj === false;
}

export function isTrue(obj: any): boolean {
	return obj === true;
}

export function isStringOrNumber(obj: any): obj is string | number {
	return isString(obj) || isNumber(obj);
}

export function isStatefulComponent(obj): boolean {
	return !isUndef(obj.prototype) && obj.prototype.render !== undefined;
}
