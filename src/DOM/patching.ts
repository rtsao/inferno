import { isUndef, Input, isInvalid, isNull, isArray, isStringOrNumber, VTextNode, VComponent, VElement, isVElement, isVComponent, VTemplate, isFalse } from '../shared';
import { replaceInputWithPlaceholder, replacePlaceholderWithInput } from './shared';
import Lifecycle from './Lifecycle';

export function patch(lastInput: Input, nextInput: Input, parentDomNode: HTMLElement, lifecycle: Lifecycle, instance: Object, namespace: string, isKeyed: boolean): void {
	if (isInvalid(nextInput)) {
		if (!isInvalid(lastInput)) {
			replaceInputWithPlaceholder(lastInput, parentDomNode, lifecycle);
		}
	} else if (isInvalid(lastInput)) {
		if (!isInvalid(nextInput)) {
			replacePlaceholderWithInput(nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed);
		}
	}
}