import { IAuthPlugin } from './Plugin';

export interface IAuthContainer {
	init(): Promise<void>;
	login(payload: any): Promise<void>;
	logout(): Promise<void>;
	refresh(): Promise<boolean>;
	addPlugin(plugin: IAuthPlugin): void;
}
