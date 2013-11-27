<?php

class Milano_SmileyManager_ViewAdmin_Export extends XenForo_ViewAdmin_Base
{
	public function renderXml()
	{
		$filename = preg_replace('/\s+/', '', $this->_params['category']['category_title']);

		$this->setDownloadFileName('smiley-' . $filename . '.xml');
		return $this->_params['xml']->saveXml();
	}
}