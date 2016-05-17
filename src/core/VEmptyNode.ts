import { VEmptyNode as VEmptyNodeType } from '../shared';

export default class VEmptyNode implements VEmptyNodeType {
	public _dom: Text = null;
	public _key: string | number = null;
	public _e = null;
}