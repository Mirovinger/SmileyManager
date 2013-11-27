<?php

class Milano_SmileyManager_Listener
{
	public static function loadAccountController($class, array &$extend)
	{
		$extend[] = 'Milano_SmileyManager_ControllerPublic_Account';
	}

	public static function loadEditorController($class, array &$extend)
	{
		$extend[] = 'Milano_SmileyManager_ControllerPublic_Editor';
	}

	public static function loadSmilieControllerAdmin($class, array &$extend)
	{
		$extend[] = 'Milano_SmileyManager_ControllerAdmin_Smilie';
	}

	public static function loadSmilieDataWriter($class, array &$extend)
	{
		$extend[] = 'Milano_SmileyManager_DataWriter_Smilie';
	}

	public static function loadUserDataWriter($class, array &$extend)
	{
		$extend[] = 'Milano_SmileyManager_DataWriter_User';
	}

	public static function loadSmilieModel($class, array &$extend)
	{
		$extend[] = 'Milano_SmileyManager_Model_Smilie';
	}

	public static function templateEditorCreate(&$templateName, array &$params, XenForo_Template_Abstract $template)
    {
        $template->addRequiredExternal('css', 'SmilieyManager_editor_smilies');
        
        if (XenForo_Application::get('options')->SmileyManager_quickloadSmiley)
        {
        	$visitor = XenForo_Visitor::getInstance();
        	if (!empty($visitor['quickload_smiley']))
        	{	
        		$template->addRequiredExternal('js', 'js/Milano/SmileyManager/editor.js');
        	}
        }
    }
}