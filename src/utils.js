export const isServer = typeof document === 'undefined' ? true : false;

export function isUndef(obj) {
	return obj === undefined;
}

export function isNullOrUndef(obj) {
	return isUndef(obj) || isNull(obj);
}

export function isNull(obj) {
	return obj === null;
}

export function isInvalid(obj) {
	return isUndef(obj) || isNull(obj) || isTrue(obj) || isFalse(obj);
}

export function isArray(obj) {
	return Array.isArray(obj);
}

export function isPromise(obj) {
	return obj instanceof Promise;
}

export function isObject(obj) {
	return typeof obj === 'object';
}

export function isString(obj) {
	return typeof obj === 'string';
}

export function isNumber(obj) {
	return typeof obj === 'number';
}

export function isFunction(obj) {
	return typeof obj === 'function';
}

export function isFalse(obj) {
	return obj === false;
}

export function isTrue(obj) {
	return obj === true;
}

export function isStringOrNumber(obj) {
	return isString(obj) || isNumber(obj);
}

export function isStatefulComponent(obj) {
	return !isUndef(obj.prototype) && obj.prototype.render !== undefined;
}
