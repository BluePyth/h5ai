
modulejs.define('ext/dropbox', ['_', '$', 'core/settings', 'core/entry', 'core/resource'], function (_, $, allsettings, entry, resource) {

	var defaults = {
			enabled: false,
			maxfiles: 5,
			maxfilesize: 20
		},

		settings = _.extend({}, defaults, allsettings.dropbox),

		template = '<div id="dropbox"><div class="label">dropbox</div><ul id="uploads" /></div>',

		uploadTemplate = '<li class="upload clearfix">' +
							'<span class="name"></span>' +
							'<span class="size"></span>' +
							'<div class="progress"><div class="bar"></div></div>' +
						'</li>',

		init = function () {

			if (!settings.enabled) {
				return;
			}

			var $dropbox = $(template).appendTo('#content');

			var uploads = {},
				afterUpload = function (err, file, timeout) {

					timeout = timeout || 5000;

					if (file) {
						uploads[file.name]
							.addClass(err ? 'error' : 'finished')
							.find('.progress').replaceWith(err ? '<span class="error">' + err + '</span>' : '<span class="finished">okay</span>');

						setTimeout(function () {
							uploads[file.name].slideUp(400, function () {

								uploads[file.name].remove();
								delete uploads[file.name];
							});
						}, timeout);
					}
				};

			// $dropbox.filedrop({
			$('html').filedrop({

				paramname: 'userfile',

				maxfiles: settings.maxfiles,
				maxfilesize: settings.maxfilesize,
				url: resource.api(),
				data: {
					action: 'upload',
					href: entry.absHref
				},

				dragOver: function () {

					$dropbox.addClass('match');
				},

				dragLeave: function () {

					$dropbox.removeClass('match');
				},

				drop: function () {

					$dropbox.removeClass('match');
				},


				beforeEach: function (file) {

					uploads[file.name] = $(uploadTemplate).appendTo('#uploads')
						.find('.name').text(file.name).end()
						.find('.size').text(file.size).end()
						.find('.progress .bar').css('width', 0).end();
				},

				progressUpdated: function (i, file, progress) {

					uploads[file.name].find('.progress .bar').css('width', '' + progress + '%');
				},

				uploadFinished: function (i, file, response) {

					afterUpload(response.code && response.msg, file);
				},

				error: function (err, file) {

					afterUpload(err, file);
				}
			});
		};

	init();
});