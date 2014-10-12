<?php

class Milano_SmileyManager_Helper_Smilie
{
	public static function parseSmilies($string)
	{
		$formatter = XenForo_BbCode_Formatter_Base::create('Base');

		$string = "<span class=\"SmileyParser\">{$string}</span>";
		
        return $formatter->replaceSmiliesInText($string, array('self', 'smiliesEscapeCallback'));
	}
}    