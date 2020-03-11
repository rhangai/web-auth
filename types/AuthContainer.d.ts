import { IAuthPlugin } from "./Plugin";

export type IAuthContainerRefreshOptions = {
	renew?: boolean;
};

export type IAuthContainerLoginResult = {
	redirectUri?: string | null;
};

export interface IAuthContainer {
	init(): Promise<void>;
	login(payload: any): Promise<IAuthContainerLoginResult | false>;
	logout(): Promise<void>;
	refresh(options: IAuthContainerRefreshOptions): Promise<boolean>;
	addPlugin(plugin: IAuthPlugin): void;
}
