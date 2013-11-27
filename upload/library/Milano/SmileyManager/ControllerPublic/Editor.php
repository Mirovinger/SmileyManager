<?php

class Milano_SmileyManager_ControllerPublic_Editor extends XFCP_Milano_SmileyManager_ControllerPublic_Editor
{
	public function actionSmilies()
	{
		$response = parent::actionSmilies();

		if ($response instanceof XenForo_ControllerResponse_View)
		{
			$categories = $this->_getCategoryModel()->getCategoriesForCache();
			$groupedSmilies = $this->_getSmilieModel()->getEditorSmilies();

			if (count(array_keys($groupedSmilies)) === count($categories))
			{
				$viewParams =& $response->params;
				
				$viewParams['categories'] = $categories;
				$viewParams['groupedSmilies'] = $groupedSmilies;
				$viewParams['tabHistory'] = XenForo_Helper_Cookie::getCookie('smTabHistory');

				unset($viewParams['smilies']);
				if (!XenForo_Application::get('options')->SmileyManager_showUncategorized)
				{
					if (isset($viewParams['categories'][0]))
					{
						unset($viewParams['categories'][0]);
					}
					if (isset($viewParams['groupedSmilies'][0]))
					{
						unset($viewParams['groupedSmilies'][0]);
					}
				}
				
				$response->templateName = 'SmilieyManager_editor_smilies';
			}
		}

		return $response;
	}

	protected function _getCategoryModel()
	{
		return $this->getModelFromCache('Milano_SmileyManager_Model_Category');
	}

	protected function _getSmilieModel()
    {
        return $this->getModelFromCache('XenForo_Model_Smilie');
    }
}