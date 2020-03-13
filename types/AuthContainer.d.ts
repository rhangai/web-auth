import { IAuthPlugin } from "./Plugin";

export type IAuthContainerRefreshOptions = {
	renew?: boolean;
};

export type IAuthContainerLoginResult = {
	redirectUri?: string | null;
};

export interface IAuthContainer {
	/**
	 * Initialize the application with saved data
	 */
	init(): Promise<void>;
	/**
	 * Perform the login
	 * @param payload Payload requested by provider
	 */
	login(payload: any): Promise<IAuthContainerLoginResult | false>;
	/**
	 * Perform the logout
	 */
	logout(): Promise<void>;
	/**
	 * Refresh the authentication data
	 * @param options
	 */
	refresh(options?: IAuthContainerRefreshOptions): Promise<boolean>;
	/**
	 * Adds a new plugin to listen for auth changes
	 * @param plugin
	 */
	addPlugin(plugin: IAuthPlugin): void;
}
