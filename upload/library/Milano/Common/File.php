<?php

class Milano_Common_File
{
	public static function getFilesFromDirectory($directory, array $extensions = array())
	{
		if (substr($directory, -1) == '/') 
		{
			$directory = substr_replace($directory , "", -1);
		}
		
		if (!$extensions)
		{
			return glob($directory . "/*");
		}

		$extensions = implode(',', $extensions);

		return glob($directory . "/*.{" . $extensions . "}", GLOB_BRACE);
	}
}