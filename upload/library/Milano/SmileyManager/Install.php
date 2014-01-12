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
				'active' => 'TINYINT(3) UNSIGNED NOT NULL DEFAULT \'0\'',
				'EXTRA' => 'PRIMARY KEY (`smilie_category_id`)',
			),
		);
	}

	protected static function _getTablePatches()
	{
		return array(
			'xf_smilie' => array('smilie_category_id' => 'INT(10) UNSIGNED DEFAULT \'0\''),
			'xf_user_option' => array('smilie_category_id' => 'TINYINT(3) UNSIGNED DEFAULT \'1\''),
		);
	}

	/* End auto-generated lines of code. */

	protected static function _preInstallBeforeTransaction()
	{
		if (self::$existingAddOn && self::$existingAddOn['version_id'] < 14)
		{
			self::_deleteDataRegistry();
		}
	}

	protected static function _postUninstallAfterTransaction()
	{
		if (XenForo_Application::getSimpleCacheData('groupedSmilies'))
		{
			XenForo_Application::setSimpleCacheData('groupedSmilies', false);
		}
		
		if (XenForo_Application::getSimpleCacheData('smilieCategories'))
		{
			XenForo_Application::setSimpleCacheData('smilieCategories', false);
		}

		self::_deleteDataRegistry();
	}

	protected static function _deleteDataRegistry()
	{
		if (XenForo_Model::create('XenForo_Model_DataRegistry')->get('groupedSmilies'))
		{
			XenForo_Model::create('XenForo_Model_DataRegistry')->delete('groupedSmilies');
		}
	}
}