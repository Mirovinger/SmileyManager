<?php

class Milano_SmileyManager_Install extends Milano_Common_Install
{
	protected static function _getTables()
	{
		$data = array();

		/*$data['smilie_category'] = "
			`smilie_category_id` int(10) unsigned NOT NULL auto_increment,
			`category_title` varchar(100) NOT NULL,
			`display_order` int(10) unsigned NOT NULL default '0',
			smilie_count int(10) unsigned NOT NULL default '0',
			`active` TINYINT(3) UNSIGNED NOT NULL default '0',
			PRIMARY KEY  (`smilie_category_id`)
		";*/

		$data['smilie_category'] = array(
			'smilie_category_id' => 'int(10) unsigned NOT NULL auto_increment',
			'category_title' => 'varchar(100) NOT NULL',
			'display_order' => "int(10) unsigned NOT NULL default '0'",
			'smilie_count' => "int(10) unsigned NOT NULL default '0'",
			'active' => "TINYINT(3) UNSIGNED NOT NULL default '0'",
			'EXTRA' => 'PRIMARY KEY (`smilie_category_id`)'
		);

		return $data;
	}

	protected static function _getTableChanges()
	{
		$data = array();

		$data['xf_smilie'] = array(
			'smilie_category_id' => 'INT(10) UNSIGNED DEFAULT 0',
			'smilie_display_order' => 'INT(10) UNSIGNED DEFAULT 0'
		);

		$data['xf_user_option'] = array(
			'quickload_smiley' => 'TINYINT(3) UNSIGNED NOT NULL DEFAULT 1'
		);

		return $data;
	}

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

		return true;
	}
}