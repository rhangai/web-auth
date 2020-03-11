import { <%= options.storage.moduleImport %> as Storage } from '<%= options.storage.module %>';
import { <%= options.scheme.moduleImport %> as Scheme } from '<%= options.scheme.module %>';

export default {
	storage: new Storage(<%= JSON.stringify(options.storage.options) %>),
	scheme: new Scheme(<%= JSON.stringify(options.scheme.options) %>),
}