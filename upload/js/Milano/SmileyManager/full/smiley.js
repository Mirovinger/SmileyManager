!function($, window, document, _undefined)
{
	XenForo.SpriteCow = function($container) { this.__construct($container); };
	XenForo.SpriteCow.prototype =
	{
		__construct: function($container)
		{
			XenForo.SmileySpriteCow.init();
		},
	}

	XenForo.SmileySpriteCow = 
	{
		init: function()
		{
			var $canvasContainer  = $('.canvas-inner');
			var $codeContainer    = $('.code-container');
			var $imageUrl       = $('#ImageUrl');
			var spriteCanvas      = new spriteCow.SpriteCanvas();
			var spriteCanvasView  = new spriteCow.SpriteCanvasView( spriteCanvas, $canvasContainer );
			var imgInput          = new spriteCow.ImgInput( $canvasContainer, $canvasContainer, $imageUrl.val() );
			var cssOutput         = new spriteCow.CssOutput( $codeContainer );
			var toolbarTop        = new spriteCow.Toolbar('.toolbar-container');
			var toolbarBottom     = new spriteCow.Toolbar('.toolbar-bottom-container');

			var $lockHeightInput = $('#lockHeight').appendTo('body').hide();
			var $lockWidthInput = $('#lockWidth').appendTo('body').hide();


			toolbarTop.
				addItem('add-smiley', XenForo.phrases.add_smiley).
				//addItem('reload-img', XenForo.phrases.reload_current_image, {noLabel: true}).
				//addItem('select-sprite', XenForo.phrases.select_sprite, {active: true}).
				addItem(
					new spriteCow.ToolbarGroup().
						addItem('select-sprite', XenForo.phrases.select_sprite, {active: true}).
						addItem('select-bg', XenForo.phrases.pick_background)
				).
				addItem('invert-bg', XenForo.phrases.toggle_dark_background, {noLabel: true});

			/*toolbarBottom.
				addItem('auto-resize', 'Auto resize', {active: true, noLabel: true}).
				addItem('lock-height', 'Lock-on height', {noLabel: true}).
				addItem('lock-width', 'Lock-on width', {noLabel: true});*/

			toolbarTop.$container.addClass('top');
			toolbarBottom.$container.addClass('bottom');

			spriteCow.pageLayout.init();

			localStorage.setItem('autoResize', 'on');
			localStorage.setItem('lockHeight', 0);
			localStorage.setItem('lockWidth', 0);

			// listeners
			imgInput.bind('load', function(img) {
				spriteCanvas.setImg(img);
				
				cssOutput.imgWidth = spriteCanvas.canvas.width;
				cssOutput.imgHeight = spriteCanvas.canvas.height;
				cssOutput.scaledWidth = Math.round( cssOutput.imgWidth / 2 );
				cssOutput.scaledHeight = Math.round( cssOutput.imgHeight / 2 );

				spriteCanvasView.setTool('select-sprite');
				cssOutput.backgroundFileName = imgInput.fileName;
				spriteCow.pageLayout.toAppView();
			});
			
			spriteCanvasView.bind('rectChange', function(rect) {
				cssOutput.rect = rect;
				cssOutput.update();

				if (rect.width === spriteCanvas.canvas.width && rect.height === spriteCanvas.canvas.height) {
					// if the rect is the same size as the whole canvas,
					// it's probably because the background is set wrong
					// let's be kind...
					toolbarTop.feedback( XenForo.phrases.incorrect_background, true );
				}
			});
			
			spriteCanvasView.bind('bgColorHover', function(color) {
				toolbarTop.feedback( XenForo.SmileySpriteCow.colourBytesToCss(color) );
			});
			
			spriteCanvasView.bind('bgColorSelect', function(color) {
				var toolName = 'select-sprite';
				spriteCanvasView.setTool(toolName);
				toolbarTop.activate(toolName);
				toolbarTop.feedback( XenForo.phrases.background_set_to_x.replace(/\{color\}/, XenForo.SmileySpriteCow.colourBytesToCss(color)) );
			});

			toolbarTop.bind('add-smiley', function(event) {
				if ($.isEmptyObject(cssOutput.output))
				{
					toolbarTop.feedback( XenForo.phrases.select_sprite_first, true );
				}
				else
				{
					var smileyData = $.extend(cssOutput.output,
					{
						sprite_image: $imageUrl.val(),
						new: $('input[name=new]').val(),
						title: $('input[name=title]').val(),
						display_order: $('input[name=display_order]').val(),
						smilie_category_id: $('input[name=smilie_category_id]').val()
					});
					
					var xenForoSmiley = new spriteCow.XenForoSmiley(smileyData);
				}
				event.preventDefault();
			});

			toolbarTop.bind('select-bg', function() {
				spriteCanvasView.setTool('select-bg');
			});
			
			toolbarTop.bind('select-sprite', function() {
				spriteCanvasView.setTool('select-sprite');
			});
			
			/*toolbarTop.bind('reload-img', function(event) {
				imgInput.reloadLastFile();
				event.preventDefault();
			});*/
			
			toolbarTop.bind('invert-bg', function(event) {
				if ( event.isActive ) {
					spriteCanvasView.setBg('#fff');
				}
				else {
					spriteCanvasView.setBg('#000');
				}
			});

			toolbarBottom.bind('auto-resize', function(event) {
				if ( event.isActive ) {
					localStorage.setItem('autoResize', 'off');
				}
				else {
					localStorage.setItem('autoResize', 'on');
				}
			});

			toolbarBottom.bind('lock-height', function(event) {
				if ( !event.isActive ) {
					$lockHeightInput.insertBefore(toolbarBottom._$feedback).show();
				}
				else {
					XenForo.SmileySpriteCow.updateInput('lockHeight', $lockHeightInput.val());
					$lockHeightInput.appendTo('body').hide();
				}
			});

			toolbarBottom.bind('lock-width', function(event) {
				if ( !event.isActive ) {
					$lockWidthInput.insertBefore(toolbarBottom._$feedback).show();
				}
				else {
					XenForo.SmileySpriteCow.updateInput('lockWidth', $lockWidthInput.val());
					$lockWidthInput.appendTo('body').hide();
				}
			});

			imgInput.loadImgUrl($imageUrl.val());
		},

		updateInput: function(name, value)
		{
			val = $.isNumeric(value) ? parseInt(value) : 0;
			localStorage.setItem(name, val);
		},

		colourBytesToCss: function(color)
		{
			if (color[3] === 0) {
				return 'transparent';
			}
			return 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', ' + String( color[3] / 255 ).slice(0, 5) + ')';
		},

		add: function(data)
		{
			XenForo.ajax('admin.php?smilies/sprite', 
				data, 
				function(ajaxData) 
				{
					if (XenForo.hasResponseError(ajaxData))
					{
						return false;
					}

					if (ajaxData.templateHtml)
					{
						$(ajaxData.templateHtml).xfInsert('appendTo', '.SmileyList', 'xfFadeIn', XenForo.speed.slow);
					}
				}
			);
		}
	};

	// *********************************************************************

	XenForo.register('.SpriteCow', 'XenForo.SpriteCow');
}
(jQuery, this, document);