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

			//console.info('New InlineModItem %o targeting %o', $ctrl, this.$target);

			/*if (this.$form.data('InlineModForm'))
			{
				var InlineModForm = this.$form.data('InlineModForm');
				if (InlineModForm.selectedIds.length)
				{
					if ($.inArray($ctrl.val(), InlineModForm.selectedIds) >= 0)
					{
						$ctrl.prop('checked', true);
					}
				}
			}*/

			this.$ctrl.bind(
			{
				change: $.context(this, 'setStyle'),
				//click: $.context(this, 'positionOverlay')
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

			/*var InlineModForm = this.$form.data('InlineModForm');
			if (InlineModForm)
			{
				InlineModForm.setSelectedIdState(this.$ctrl.val(), this.$ctrl.prop('checked'));
			}*/
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
		},

		/**
		 * Hides the current tooltip and opens (or moves) the controls overlay
		 *
		 * @param event
		 */
		positionOverlay: function(e)
		{
			if (this.$ctrl.data('target'))
			{
				var tooltip,
					InlineModForm = this.$form.data('InlineModForm');

				if (InlineModForm)
				{
					if (tooltip = this.$ctrl.data('tooltip'))
					{
						this.$ctrl.data('tooltip').hide();
					}
					InlineModForm.positionOverlay(e.target);
				}
			}
		},
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