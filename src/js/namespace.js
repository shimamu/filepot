(function(ns){
	function namespace(string) {
		var object = window;
		var levels = string.split(".");

		for (var i = 0, l = levels.length; i < l; i++) {
			if (typeof object[levels[i]] == "undefined") {
				object[levels[i]] = {};
			}

			object = object[levels[i]];
		}

		return object;
	}

	return namespace(ns);
}("com.github.shimamu.filepot"));
