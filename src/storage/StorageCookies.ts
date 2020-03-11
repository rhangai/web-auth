import { IAuthStorage } from "../../types/Storage";

export class StorageCookies implements IAuthStorage {
	private cookieName: string;

	constructor(options: any = {}) {
		this.cookieName = options.cookieName || "_s";
	}

	async save(state: any): Promise<void> {
		StorageCookies.cookieSet(this.cookieName, state);
	}

	async load(): Promise<any> {
		return StorageCookies.cookieGet(this.cookieName);
	}

	private static cookieGet(name: string) {
		if (document.cookie.length === 0) return null;

		var c_start = document.cookie.indexOf(`${name}=`);
		if (c_start === -1) return null;

		c_start = c_start + name.length + 1;
		var c_end = document.cookie.indexOf(";", c_start);
		if (c_end == -1) c_end = document.cookie.length;

		const stringValue = decodeURIComponent(document.cookie.substring(c_start, c_end));
		return JSON.parse(stringValue);
	}

	private static cookieSet(name: string, value: any, expireIn: number = -1) {
		// if (expireIn > 0) {
		// 	let seconds = new Date().getTime() + 1000 * 60 * 60 * 24 * expireIn;
		// 	let date = new Date(seconds).toUTCString();
		// 	document.cookie = name + `=${encodeURIComponent(value)}; expires=${date}; path=/`;
		// } else {
		const stringValue = JSON.stringify(value);
		document.cookie = name + `=${encodeURIComponent(stringValue)}; path=/`;
		// }
	}
}
