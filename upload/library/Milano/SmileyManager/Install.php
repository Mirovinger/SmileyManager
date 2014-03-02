<?php

class Milano_SmileyManager_Install extends Milano_Common_Install
{
	/* Start auto-generated lines of code. */

	protected static function _getTablePatches()
	{
		return array('xf_user_option' => array('quickload_smiley' => 'TINYINT(3) UNSIGNED DEFAULT \'1\''));
	}

	/* End auto-generated lines of code. */

	protected static function _preInstall()
	{
		self::_deleteSimpleCacheData();
		self::_deleteDataRegistry();
		self::dropTablePatches(array(
            'xf_smilie' => array(
            	'smilie_display_order' => 'INT(10) UNSIGNED DEFAULT \'0\''
            ))
		);
	}

	protected static function _deleteSimpleCacheData()
	{
		if (XenForo_Application::getSimpleCacheData('groupedSmilies'))
		{
			XenForo_Application::setSimpleCacheData('groupedSmilies', false);
		}
		
		if (XenForo_Application::getSimpleCacheData('smilieCategories'))
		{
			XenForo_Application::setSimpleCacheData('smilieCategories', false);
		}
	}

	protected static function _deleteDataRegistry()
	{
		if (XenForo_Model::create('XenForo_Model_DataRegistry')->get('groupedSmilies'))
		{
			XenForo_Model::create('XenForo_Model_DataRegistry')->delete('groupedSmilies');
		}
	}
}