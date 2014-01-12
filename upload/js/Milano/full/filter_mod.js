!function($, window, document, _undefined)
{
	XenForo.FilterModItem = function($ctrl) { this.__construct($ctrl); };
	XenForo.FilterModItem.prototype =
	{
		__construct: function($ctrl)
		{
			this.$form = $ctrl.closest('form');

			this.$ctrl = $ctrl;
			
			//this.$target = $($ctrl.data('target'));
			this.$target = $ctrl.closest('li');

			this.$ctrl.bind(
			{
				change: $.context(this, 'setStyle'),
			});

			this.setStyle();
		},

		/**
		 * Set the state of the checkbox programatically
		 */
		setState: function(e)
		{
			//console.log('Setting state for %o, %o to %s', this.$ctrl, this.$target, this.$ctrl.is(':checked'));
			this.setStyle();
		},

		/**
		 * Alter the style of the target based on checkbox state
		 */
		setStyle: function()
		{
			//console.log('set Style');
			if (this.$ctrl.is(':checked'))
			{
				this.$target.addClass('Last');
			}
			else
			{
				this.$target.removeClass('Last');
			}
		}
	};

	// *********************************************************************

	XenForo.register('.FilterModCheck input:checkbox', 'XenForo.FilterModItem');

}
(jQuery, this, document);


/**
 * This is a dirty fix for XenForo.CheckAll function 
 * We have to trigger change event when the checboxes are 
 * checked by CheckAll checkbox
 */
$.propHooks.checked = {
	set: function(elem, value, name) {
    	var ret = (elem[ name ] = value);
    	$(elem).trigger("change");
    	return ret;
  	}
};