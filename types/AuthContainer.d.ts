import { IAuthPlugin } from "./Plugin";

export type IAuthContainerRefreshOptions = {
	renew?: boolean;
};

export interface IAuthContainer {
	init(): Promise<void>;
	login(payload: any): Promise<void>;
	logout(): Promise<void>;
	refresh(options: IAuthContainerRefreshOptions): Promise<boolean>;
	addPlugin(plugin: IAuthPlugin): void;
}
