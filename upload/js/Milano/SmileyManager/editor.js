!function($, window, document, _undefined)
{
	if(typeof RedactorPlugins == 'undefined')				
		RedactorPlugins = {};

	RedactorPlugins['SmileyManager'] = 
	{
		init: function()
		{
			var bbCode = XenForo.BbCodeWysiwygEditor.prototype,
				self = this;
			
			smileyLoaded = false;

			self.$editor.on('focus click keydown', function() {
				if (!smileyLoaded)
				{	
					self.$toolbar.find('.redactor_btn_smilies').click();
					smileyLoaded = true;
				}				
			});
		}
	}

	XenForo.RedactorSmiley = function($textarea) { this.__construct($textarea); };
	XenForo.RedactorSmiley.prototype =
	{
		__construct: function($textarea)
		{
			this.$editor = $textarea;

			var redactorOptions = $textarea.data('options'), 			
			myOptions = {
				editorOptions:{
					plugins: ['SmileyManager']
				}
			};

			//$textarea.data('options', $.extend(redactorOptions, myOptions));
			$.extend(true, redactorOptions, myOptions);
		},
	};

	// *********************************************************************

	XenForo.register('textarea.BbCodeWysiwygEditor', 'XenForo.RedactorSmiley');
}
(jQuery, this, document);