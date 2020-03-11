# @rhangai/web-auth

Authentication for Web Applications

## Usage with nuxt

```js
module.exports = {
	// ...

	//
	modules: ["@rhangai/web-auth"],
	auth: {
		config: "~/config/auth.config"
	},
	build: {
		transpile: ["@rhangai/web-auth"]
	}
};
```

Then create a file `config/auth.config.js`

```js
export default function(context) {
	return {
		provider: new MyProvider(),
		storage: new MyStorage()
	};
}
```
