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
}
(jQuery, this, document);