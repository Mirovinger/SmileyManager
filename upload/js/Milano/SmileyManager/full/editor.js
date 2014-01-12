!function($, window, document, _undefined)
{
	if(typeof RedactorPlugins == 'undefined')				
		RedactorPlugins = {};

	RedactorPlugins['SmileyManager'] = 
	{
		init: function()
		{
			var self = this;
			
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

	/*XenForo.RedactorSmiley = function($textarea) { this.__construct($textarea); };
	XenForo.RedactorSmiley.prototype =
	{
		__construct: function($textarea)
		{
			var redactorOptions = $textarea.data('options');
			redactorOptions.editorOptions.plugins = [];

			redactorOptions.editorOptions.plugins.push['SmileyManager'];
		},
	};

	// *********************************************************************

	XenForo.register('textarea.BbCodeWysiwygEditor', 'XenForo.RedactorSmiley');*/
}
(jQuery, this, document);