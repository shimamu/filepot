/*
 *   filepot.js
 *   https://github.com/shimamu/filepot/
 *   (c) 2015 Ryo Shimamura
 *       filepot may be freely distributed under the MIT license.
 */

(function() {
	var project = com.github.shimamu.filepot;

	var Config = (function() {
		var $self = function() {
			return $("#config");
		};

		function findOption(name) {
			return $self().find("[name=" + name + "]");
		}

		function attrValue(name) {
			return function(value) {
				if (value) {
					findOption(name).attr("value", value);
					return this;
				}
				return findOption(name).attr("value");
			};
		}

		return {
			animation: attrValue("animation"),

			locale: attrValue("locale"),

			animationSpeed: function() {
				return this.isAnimation() ? 1000 : 0; // milli sec
			},

			isAnimation: function() {
				return this.animation() === "on";
			},
		};
	})();

	/*
	 *   If you want to add language, add data to 'var lang'.
	 *   Data format is below.
	 *
	 *   xx: { // <-- short label for distinguish in program.
	 *   	_LANGUAGE_LABEL: "XXXXX", // <-- long label for display in select form.
	 *   	....
	 *   }
	 */
	var Language = (function() {
		var lang = {
			en: {
				_LANGUAGE_LABEL: "English",
				ARE_YOU_SURE_YOU_WANT_TO_LEAVE_THIS_PAGE: "Are you sure you want to leave this page?",
				THIS_BROWSER_IS_NOT_SUPPORTED: "This browser is not supported for filepot.",
				DOWNLOAD_SNAPSHOT: "download snapshot",
				PLEASE_WRITE_A_COMMENT: "Please write a comment.",
				DROP_FILES_HERE: "Drop files here.",
				OR: "or",
				SAVE: "save",
				SAVE: "save",
				NEW: "new",
				UNDO: "undo",
				UPDATE: "update",
				DISPLAY_ONLY_THIS_FILE: "Display only this file.",
				WRITE_A_COMMENT: "Write a comment.",
				SAVE_ONLY_LATEST_VERSION: "Save only latest version.",
				CAN_NOT_SAVE_BECAUSE_NOT_FILE: "Can't save because not file.",
			},

			ja: {
				_LANGUAGE_LABEL: "日本語",
				ARE_YOU_SURE_YOU_WANT_TO_LEAVE_THIS_PAGE: "本当にこのページから離れますか？",
				THIS_BROWSER_IS_NOT_SUPPORTED: "このブラウザにfilepotは対応していません。",
				DOWNLOAD_SNAPSHOT: "まとめてダウンロード",
				PLEASE_WRITE_A_COMMENT: "コメントを入力してください。",
				DROP_FILES_HERE: "ここにドロップしたファイルを登録します。",
				OR: "もしくは",
				SAVE: "保存",
				NEW: "新規",
				UNDO: "1つ戻す",
				UPDATE: "更新",
				DISPLAY_ONLY_THIS_FILE: "このファイルのみ表示する。",
				WRITE_A_COMMENT: "コメントを入力する。",
				SAVE_ONLY_LATEST_VERSION: "最新版のみ残して保存。",
				CAN_NOT_SAVE_BECAUSE_NOT_FILE: "ファイルではないため、保存できません。",
			},
		};

		function label(lang, locale) {
			return {
				label: locale,
				value: lang._LANGUAGE_LABEL
			};
		};

		return {
			dictionary: function(locale) {
				return lang[locale] || lang.en;
			},

			catalog: function() {
				return _.map(lang, label);
			},
		};
	})();

	function translate(locale) {
		return function(text) {
			return Language.dictionary(locale)[text];
		};
	};

	function message(text) {
		return translate(Config.locale())(text);
	};

	function template(selector, data) {
		var $element = $(selector).tmpl(data);
		EventListener.setOnClick($element);
		Service.setMessage($element);
		return $element;
	}

	function No(_first, _step) {
		var first = _first || 1;

		var step = _step || 1;

		return function(_value) {
			return {
				next: function() {
					return No(first, step)(this.valueOf() + step);
				},

				prev: function() {
					return No(first, step)(this.valueOf() - step);
				},

				toString: function() {
					return this.valueOf() + "";
				},

				valueOf: function() {
					return parseInt(_value) || first;
				},
			};
		};
	};

	var TagNo = No();

	var StoredFileNo = No();

	var StoredFileVersionNo = No();

	var BranchNo = No();

	function FileName(_text) {
		return {
			toString: function() {
				return _text;
			},
		};
	};

	function FileStatus(_status) {
		var msg = {
			new: "NEW",
			other: "CAN_NOT_SAVE_BECAUSE_NOT_FILE",
			update: "UPDATE",
		};

		return {
			isNew: function() {
				return _status === "new";
			},

			isStay: function() {
				return _status === "stay";
			},

			isUpdate: function() {
				return _status === "update";
			},

			message: function() {
				return msg[_status];
			},

			toString: function() {
				return _status;
			},
		};
	};

	/*
	 * <Reference>
	 *   - Data URI format
	 *     data:[<MIME-type>][;charset=<encoding>][;base64],<data>
	 */
	function DataURL(_text) {
		return {
			decodedString: function() {
				return atob(this.data().split(',')[1]);
			},

			data: function() {
				return _text;
			},

			mime: function() {
				return this.data().split(',')[0].split(':')[1].split(';')[0];
			},

			toBlob: function() {
				var dataArray = new Uint8Array(this.toByte().data());
				return new Blob([dataArray], {type: this.mime()});
			},

			toByte: function() {
				var dataByte = project.ECL.charset.Unicode.parse(this.decodedString());
				return DataByte(dataByte);
			},

			toString: function() {
				return this.data();
			},
		};
	};

	function DataByte(_text) {
		return {
			data: function() {
				return _text;
			},
		};
	};

	function CutOff() {
		var backup = [];

		var currentBranchNo;

		return {
			cut: function() {
				$("[type=data]").each(function() {
					var element = {
						$original: $(this),
						$clone: $(this.cloneNode(false)),
					};
					element.$original.replaceWith(element.$clone);
					backup.push(element);
				});

				currentBranchNo = Rcf.branchNo();
				Rcf.branchNo(BranchNo());
				return this;
			},

			repare: function() {
				_.each(backup, function(element) {
					element.$clone.replaceWith(element.$original);
				});
				Rcf.branchNo(currentBranchNo);
				return this;
			},
		};
	};

	function CutExceptFirstElement() {
		var repositoryBackup;

		var $commitHistoryBackup;

		var currentBranchNo;

		return {
			cut: function() {
				repositoryBackup = Repository.deleteExceptLatestVersion();
				$commitHistoryBackup = CommitHistory.deleteExceptLatestTag();

				currentBranchNo = Rcf.branchNo();
				Rcf.branchNo(currentBranchNo.next());
				return this;
			},

			repare: function() {
				Repository.restore(repositoryBackup);
				CommitHistory.restore($commitHistoryBackup);
				Rcf.branchNo(currentBranchNo);
				return this;
			},
		};
	};

	function FileCutter(_cutPattern) {
		return {
			cutAndRepare: function(callback) {
				var backup = _cutPattern().cut();
				callback();
				backup.repare();
			},
		};
	};

	var Download = (function() {
		return {
			file: function(_$element, _blob, _fileName) {
				if (window.navigator.msSaveBlob) {
					window.navigator.msSaveOrOpenBlob(_blob, _fileName);
				} else {
					_$element.attr("download", _fileName).attr("href", URL.createObjectURL(_blob));
				}
				return this;
			},

			currentHtml: function(_$element, _fileName) {
				var src = "<!DOCTYPE html>\n<html>\n" + $("*").html() + "\n<html>\n";
				var blob = new Blob([src], {type: "text\/html"});
				this.file(_$element, blob, _fileName);
				return this;
			},
		};
	})();

	var Command = (function() {
		return {
			requestComment: function(_$element) {
				var text = window.prompt(message("PLEASE_WRITE_A_COMMENT"), "");
				var currentFile = CommitHistory.findCurrentFileBy(_$element);
				currentFile.comment().add(text);
				return this;
			},

			downloadBranchFilePot: function(_$element) {
				var fileName = function() {
					return FileName("filepot.html");
				};

				FileCutter(CutExceptFirstElement).cutAndRepare(function() {
					Download.currentHtml(_$element, fileName());
				});
				return this;
			},

			downloadCurrentFile: function(_$element) {
				var currentFile = CommitHistory.findCurrentFileBy(_$element);
				Download.file(_$element, currentFile.dataURL().toBlob(), currentFile.name());
				return this;
			},

			downloadFilePot: function(_$element) {
				var fileName = function() {
					return FileName("filepot.html");
				};

				Download.currentHtml(_$element, fileName());
				return this;
			},

			downloadNewFilePot: function(_$element) {
				var fileName = function() {
					return FileName("empty.html");
				};

				FileCutter(CutOff).cutAndRepare(function() {
					Download.currentHtml(_$element, fileName());
				});
				return this;
			},

			downloadSnapShot: function(_$element) {
				var fileName = function() {
					return FileName("snapshot.zip");
				};

				var zip = function() {
					return CommitHistory.findTagBy(_$element).snapShot().zip();
				};

				Download.file(_$element, zip().blob(), fileName());
				return this;
			},

			filterCurrentFile: function(_$element) {
				var currentFile = CommitHistory.findCurrentFileBy(_$element);
				CommitHistory.toggleFilter(currentFile);
				return this;
			},

			undo: function(_$element) {
				var tag = CommitHistory.latestTag();
				if (tag) {
					tag.remove();
				}
				return this;
			},
		};
	})();

	function executeCommand(_$element) {
		var className = _$element.attr("command");
		Command[className](_$element);
	};

	var Rcf = (function() {
		var $branch = $("#branch");

		return {
			branchNo: function(no) {
				if (no) {
					$branch.text(no);
				} else {
					return BranchNo($branch.text());
				}
			},

			version: function() {
				return $( "#version" ).text();
			},
		};
	})();

	var Repository = (function() {
		var $self = function() {
			return $("#repository");
		};

		return {
			add: function(fileName) {
				$self().prepend(createStoredFile(this.newStoredFileNo(), fileName));
				return this;
			},

			checkout: function(fileName) {
				var $element = $self().children( "[fileName='" + fileName + "']" );
				if ($element.length) {
					return StoredFile($element);
				}
			},

			commit: function(fileList) {
				CommitHistory.record(this.status(fileList));
				return this;
			},

			undo: function(fileName) {
				var storedFile = this.checkout(fileName);
				storedFile.undo();
				return this;
			},

			deleteExceptLatestVersion: function() {
				var backup = [];
				$self().children().each(function() {
					backup.push({
						$file: $( this ),
						$data: $( this ).children( ":not(:first)" ).detach(),
					});
				});
				return backup;
			},

			latestStoredFile: function() {
				if (this.length()) {
					return StoredFile($self().children(":first"));
				}
			},

			length: function() {
				return $self().children().length;
			},

			list: function() {
				return $self().children(".File").map(function(index, element) {
					return StoredFile($(element)).name();
				}).get();
			},

			newStoredFileNo: function() {
				if (this.latestStoredFile()) {
					return this.latestStoredFile().no().next();
				}
				return new StoredFileNo();
			},

			restore: function(backup) {
				_.each(backup, function(stored) {
					stored.$file.append(stored.$data);
				});
				return this;
			},

			status: function(fileList) {
				return StatusFileList(this.list()).update(fileList);
			},

			store: function(fileName, dataURL) {
				var storedFile = this.checkout(fileName);
				if (!storedFile) {
					this.add(fileName);
					storedFile = this.checkout(fileName);
				}
				if (storedFile.dataURL(storedFile.latestVersionNo()).data() === dataURL.data()) {
					return FileStatus("stay");
				}
				storedFile.add(dataURL);
			},
		};
	})();

	function StoredFile(_$element) {
		return {
			add: function(dataURL) {
				_$element.prepend(template("#StoredFileDataTemplate", [{
					dataURL: dataURL,
					version: this.newVersionNo(),
				}]));
				return this;
			},

			dataURL: function(version) {
				return DataURL(_$element.children("[version=" + version + "]").attr("dataurl"));
			},

			latestVersionNo: function() {
				if (this.length()) {
					return new StoredFileVersionNo(_$element.children(":first").attr("version"));
				}
			},

			length: function() {
				return _$element.children().length;
			},

			name: function() {
				return FileName(_$element.attr("fileName"));
			},

			newVersionNo: function() {
				if (this.length()) {
					return this.latestVersionNo().next();
				}
				return new StoredFileVersionNo();
			},

			no: function() {
				return new StoredFileNo(_$element.attr("no"));
			},

			remove: function() {
				_$element.remove();
				return this;
			},

			undo: function() {
				if (this.length()) {
					_$element.children("[version=" + this.latestVersionNo() + "]").remove();
				}
				if (!this.length()) {
					this.remove();
				}
				return this;
			},
		};
	};

	function createStoredFile(storedFileNo, fileName) {
		return $("#StoredFileTemplate").tmpl([{
			no: storedFileNo,
			fileName: fileName
		}]);
	};

	function StatusFileList(_param) {
		function has(fileName) {
			return fileName in hash();
		};

		function hash() {
			if (_param instanceof Array) {
				return stayStatusFile(_param);
			}
			return _param;
		};

		function newOrUpdateStatusFile(fileName, file) {
			var status = FileStatus(has(fileName) ? "update" : "new");
			return StatusFile(fileName, status, file);
		};

		function stayStatusFile(list) {
			return _.reduce(list, function(memo, fileName) {
				memo[fileName] = StatusFile(fileName, FileStatus("stay"));
				return memo;
			}, {});
		};

		return {
			each: function(callback) {
				var keys = Object.keys(hash()).sort();
				keys.forEach(function(key) {
					callback(hash()[key]);
				});
			},

			update: function(fileList) {
				var copy = _.clone(hash());
				for (var i = 0; i < fileList.length; i++) {
					var fileName = FileName(fileList[i].name);
					copy[fileName] = newOrUpdateStatusFile(fileName, fileList[i]);
				}
				return StatusFileList(copy);
			},
		};
	};

	function StatusFile(_fileName, _status, _file) {
		return {
			name: function() {
				return _fileName;
			},

			originalFile: function() {
				if (this.status().isNew() || this.status().isUpdate()) {
					return _file;
				}
			},

			status: function() {
				return _status;
			},
		};
	};

	function FileLoader(_statusFile, _listener) {
		function errorHandle(event) {
			console.log("Error occurred during reading a file.");
			var fileStatus = Repository.store(_statusFile.name(), 
				DataURL("data:text/plain;base64,ZmFpbCB0byByZWdpc3Rlci4="));
			_listener.onload(FileStatus("other"));
		};

		function loadHandle(event) {
			var dataURL = DataURL(event.target.result);
			var fileStatus = Repository.store(_statusFile.name(), dataURL);
			_listener.onload(fileStatus);
		};

		function progressHandle(event) {
			_listener.onprogress(event);
		}

		function fileReader() {
			var reader = new FileReader();

			reader.onerror = errorHandle;
			reader.onprogress = progressHandle;
			reader.onload = loadHandle;

			return reader;
		};

		return {
			load: function() {
				if (_statusFile.status().isStay()) {
					_listener.onload();
					return;
				}

				var reader = fileReader();
				reader.readAsDataURL(_statusFile.originalFile());
				return this;
			},
		};
	};
	
	var CommitHistory = (function() {
		var $self = function() {
			return $("#commitHistory");
		};

		var isCurrentFileHidden = function() {
			return $self().find(".currentFile:hidden").length > 0;
		};

		return {
			deleteExceptLatestTag: function() {
				return $self().children(":not(:first)").detach();
			},

			findCurrentFileBy: function($element) {
				return CurrentFile($element.parents(".currentFile"));
			},

			findTagBy: function($element) {
				return new Tag($element.parents(".Tag"));
			},

			hideCurrentFileExcept: function(currentFile) {
				$self().find(".currentFile" + "[filename!='" + currentFile.name() + "']").hide(Config.animationSpeed());
				return this;
			},

			latestTag: function() {
				if (this.length()) {
					return new Tag($self().children(":first"));
				}
			},

			length: function() {
				return $self().children().length;
			},

			newTagNo: function() {
				if (this.latestTag()) {
					return this.latestTag().no().next();
				}
				return new TagNo();
			},

			record: function(statusFileList) {
				var $tag = createTag(this.newTagNo(), statusFileList).hide();
				$self().prepend($tag);
				//$tag.fadeIn(Config.animationSpeed());
				$tag.show(Config.animationSpeed());
				return this;
			},

			restore: function($backup) {
				$self().append($backup);
				return this;
			},

			showCurrentFile: function() {
				$self().find(".currentFile").show(Config.animationSpeed());
				return this;
			},

			toggleFilter: function(currentFile) {
				if (isCurrentFileHidden()) {
					this.showCurrentFile();
					return this;
				}
				this.hideCurrentFileExcept(currentFile);
				return this;
			},
		};
	})();

	function Tag(_$element) {
		return {
			remove: function() {
				_$element.find(".currentFile").each(function() {
					var currentFile = CurrentFile($(this));
					if (currentFile.status().isNew() || currentFile.status().isUpdate()) {
						Repository.undo(currentFile.name());
					}
				});
				_$element.remove();
				return this;
			},

			no: function() {
				return new TagNo(parseInt(_$element.attr("no")));
			},

			snapShot: function() {
				return new SnapShot(_$element.find(".snapshot"));
			},
		};
	};

	function createTag(tagNo, statusFileList) {
		var date = new Date();
		var data = [{
			no: tagNo,
			date: date.toLocaleString(),
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate()
		}];
		return template("#TagTemplate", data)
		.append(createSnapShot(statusFileList))
		.append(template("#TagFooterTemplate"));
	};

	function SnapShot(_$element) {
		return {
			zip: function() {
				var zip = new project.Zip;
				_$element.find(".currentFile").each(function() {
					var currentFile = CurrentFile($(this));
					zip.addFile(currentFile.dataURL().toByte().data(), currentFile.name().toString());
				});
				return zip;
			},
		};
	};

	function createSnapShot(statusFileList) {
		var $snapShot = template("#SnapShotTemplate");

		var appendCurrentFile = function(statusFile) {
			var $currentFile = createCurrentFile(statusFile);
			$snapShot.append($currentFile);
			return CurrentFile($currentFile);
		};

		var loadFile = function(statusFile, currentFile) {
			FileLoader(statusFile, currentFile).load();
		};

		statusFileList.each(function(statusFile) {
			var currentFile = appendCurrentFile(statusFile);
			loadFile(statusFile, currentFile);
		});

		return $snapShot;
	};

	function CurrentFile(_$element) {
		return {
			checkout: function() {
				return Repository.checkout(this.name());
			},

			comment: function() {
				return Comment(_$element.find(".commentList"));
			},

			dataURL: function() {
				return this.checkout().dataURL(this.version());
			},

			name: function() {
				return FileName(_$element.attr("fileName"));
			},

			onload: function(fileStatus) {
				this.update(fileStatus);
				return this;
			},

			onprogress: function(event) {
				var percent = (event.loaded / event.total * 100).toFixed(1);
				//_$element.text(event.loaded + " / " + event.total + " byte (" + percent + " %)");
				_$element.text(" (" + percent + " %)");
				return this;
			},

			status: function() {
				return FileStatus(_$element.attr("status"));
			},

			update: function(fileStatus) {
				var storedFile = this.checkout();
				var status = fileStatus || this.status();
				var $element = template("#CurrentFileUpdateTemplate", [{
					fileName: this.name(),
					no      : storedFile.no(),
					status  : status,
					message : status.message(),
					version : storedFile.latestVersionNo()
				}]);
				$element.append(createCommentInput()).append(createFilter());
				_$element.replaceWith($element);
				return this;
			},

			version: function() {
				return new StoredFileVersionNo(_$element.attr("version"));
			},
		};
	};

	function createCurrentFile(statusFile) {
		return template("#CurrentFileTemplate", [{
			fileName: statusFile.name(),
			status: statusFile.status()
		}]);
	};

	function createFilter() {
		return template("#CurrentFileFilterTemplate");
	};

	function Comment(_$element) {
		return {
			add: function(text) {
				if (!text) {
					return;
				}
				var date = new Date();
				template("#CommentItemTemplate", [{
					text: text,
					year: date.getFullYear(),
					month: date.getMonth() + 1,
					day: date.getDate()
				}])
				.appendTo(_$element);
				return this;
			},
		};
	};

	function createCommentInput(statusFile) {
		return template("#CommentInputTemplate");
	};

	var EventListener = (function() {
		return {
			setBeforeUnload: function() {
				$(window).on("beforeunload", function(event){
					return message("ARE_YOU_SURE_YOU_WANT_TO_LEAVE_THIS_PAGE");
				});
				return this;
			},

			setOnChange: function(event) {
				$("#fileSelector").bind("change", function(event) {
					var files = event.originalEvent.target.files;
					Repository.commit(files);
				});
				return this;
			},

			setOnChangeLanguage: function(event) {
				$("#language").bind("change", function(lang) {
					Config.locale($("#language").val());
					Service.setMessage();
				});
				return this;
			},

			setOnClick: function($element) {
				var $a = $element ? $element.find("a") : $("a");
				$a.click(function(event) {
					executeCommand($(this));
				});
				return this;
			},

			setOnDragOver: function(event) {
				$("#drop").bind("dragover", function(event) {
					event.preventDefault();
				});
				return this;
			},

			setOnDrop: function(event) {
				$("#drop").bind("drop", function(event) {
					var files = event.originalEvent.dataTransfer.files;
					Repository.commit(files);
					event.preventDefault();
				});
				return this;
			},

			set: function() {
				this.setOnDrop();
				this.setOnDragOver();
				this.setOnChange();
				this.setOnChangeLanguage();
				this.setOnClick();
				this.setBeforeUnload();
				return this;
			},
		};
	})();

	var Service = (function() {
		return {
			isSupportedBrowser: function() {
				return (window.File);
			},

			setLanguage: function() {
				$("#language")
					.empty()
					.append(template("#LanguageTemplate", Language.catalog()))
					.val(Config.locale());
				return this;
			},

			setMessage: function($element) {
				($element || $("*")).find("a,span").map(function() {
					$(this).attr("title", message($(this).attr("value")));
				});
				$("span[type=msg]").map(function() {
					$(this).text(message($(this).attr("value")));
				});
				return this;
			},

			setup: function() {
				if (this.isSupportedBrowser()) {
					console.log("File API is implemented.");
					EventListener.set();
					this.setLanguage();
					this.setMessage();
				} else {
					alert(message("THIS_BROWSER_IS_NOT_SUPPORTED"));
				}
				return this;
			},
		};
	})();

	Service.setup();
}());

