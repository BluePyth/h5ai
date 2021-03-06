
modulejs.define('ext/dropbox', ['_', '$', 'core/settings', 'core/entry', 'core/resource', 'core/refresh'], function (_, $, allsettings, entry, resource, refresh) {

	var defaults = {
			enabled: false,
			maxfiles: 5,
			maxfilesize: 20
		},

		settings = _.extend({}, defaults, allsettings.dropbox),

		template = '<ul id="uploads" />',

		uploadTemplate = '<li class="upload clearfix">' +
							'<span class="name"></span>' +
							'<span class="size"></span>' +
							'<div class="progress"><div class="bar"></div></div>' +
						'</li>',

		init = function () {

			if (!settings.enabled) {
				return;
			}

			var $content = $('#content').append(template);

			var uploads = {},
				afterUpload = function (err, file) {

					if (file) {
						uploads[file.name]
							.addClass(err ? 'error' : 'finished')
							.find('.progress').replaceWith(err ? '<span class="error">' + err + '</span>' : '<span class="finished">okay</span>');

						setTimeout(function () {
							uploads[file.name].slideUp(400, function () {

								uploads[file.name].remove();
								delete uploads[file.name];
							});
						}, 5000);
					}
				};

			$content.filedrop({

				paramname: 'userfile',

				maxfiles: settings.maxfiles,
				maxfilesize: settings.maxfilesize,
				url: resource.api(),
				data: {
					action: 'upload',
					href: entry.absHref
				},

				docEnter: function () {

					$content.addClass('hint');
				},

				docLeave: function () {

					$content.removeClass('hint');
				},

				dragOver: function () {

					$content.addClass('match');
				},

				dragLeave: function () {

					$content.removeClass('match');
				},

				drop: function () {

					$content.removeClass('hint match');
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

				afterAll: function () {

					refresh();
				},

				error: function (err, file) {

					afterUpload(err, file);
				}
			});
		};

	init();
});
