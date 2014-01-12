<?php

class Milano_SmileyManager_Install extends Milano_Common_Install
{
	/* Start auto-generated lines of code. */

	protected static function _getTables()
	{
		return array(
			'smilie_category' => array(
				'smilie_category_id' => 'INT(10) UNSIGNED AUTO_INCREMENT',
				'category_title' => 'VARCHAR(100) NOT NULL',
				'display_order' => 'INT(10) UNSIGNED NOT NULL DEFAULT \'0\'',
				'smilie_count' => 'INT(10) UNSIGNED NOT NULL DEFAULT \'0\'',
				'active' => 'INT(11) NOT NULL DEFAULT \'0\'',
				'EXTRA' => 'PRIMARY KEY (`smilie_category_id`)',
			),
		);
	}

	protected static function _getTablePatches()
	{
		return array(
			'xf_smilie' => array('smilie_category_id' => 'INT(10) UNSIGNED DEFAULT \'0\''),
			'xf_user_option' => array('smilie_category_id' => 'INT(11) DEFAULT \'1\''),
		);
	}

	/* End auto-generated lines of code. */
}