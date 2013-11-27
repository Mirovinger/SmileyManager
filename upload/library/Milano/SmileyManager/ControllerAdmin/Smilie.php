<?php

class Milano_SmileyManager_ControllerAdmin_Smilie extends XFCP_Milano_SmileyManager_ControllerAdmin_Smilie
{
	public function actionIndex()
	{
		$response = parent::actionIndex();

		if ($response instanceof XenForo_ControllerResponse_View)
		{
			$viewParams =& $response->params;

			$update = $this->_input->filterSingle('update', XenForo_Input::UINT);

			$groupedSmilies = $this->_getSmilieModel()->groupedSmiliesByCategory();
			$smilieCategories = $this->_getCategoryModel()->getCategories(false);

			$viewParams['groupedSmilies'] = $this->_getSmilieModel()->prepareGroupedSmiliesForList($groupedSmilies);
			$viewParams['smilieCategories'] = $smilieCategories;
			$viewParams['smilieCount'] = count($viewParams['smilies']);
			$viewParams['update'] = $update;
			
			unset($viewParams['smilies']);

			$response->templateName = 'SmileyManager_smilie_list';
		}

		return $response;
	}

	public function actionAdd()
	{
		$response = parent::actionAdd();

		if ($response instanceof XenForo_ControllerResponse_View)
		{
			if ($categoryId = $this->_input->filterSingle('smilie_category_id', XenForo_Input::UINT))
			{
				$response->params['smilie']['smilie_category_id'] = $categoryId;
			}
			$response->params['categoryOptions'] = $this->_getCategoryModel()->getCategoryOptions();
		}

		return $response;
	}

	public function actionEdit()
	{
		$response = parent::actionEdit();

		if ($response instanceof XenForo_ControllerResponse_View)
		{
			$response->params['categoryOptions'] = $this->_getCategoryModel()->getCategoryOptions();
		}

		return $response;
	}

	public function actionSave()
	{
		$GLOBALS['Milano_SmileyManager_ControllerAdmin_Smilie'] = $this;
		
		return parent::actionSave();
	}

	public function actionBatchUpdate()
	{
		if ($smilieIds = $this->_input->filterSingle('smilie_ids', XenForo_Input::JSON_ARRAY))
		{
			$categoryModel = $this->_getCategoryModel();

			$totalSmilies = count($smilieIds);

			if ($this->isConfirmedPost())
			{
				$categoryId = $this->_input->filterSingle('smilie_category_id', XenForo_Input::UINT);

				$this->_getSmilieModel()->updateSmiliesToCategory($smilieIds, $categoryId);
				$category = $categoryModel->getCategoryById($categoryId);

				return $this->responseRedirect(
					XenForo_ControllerResponse_Redirect::SUCCESS,
					XenForo_Link::buildAdminLink('smilie-categories', $category)
				);
			}
			else
			{
				return $this->responseView('Milano_SmileyManager_ViewAdmin_Smilie_BatchUpdate', 'SmileyManager_smilie_batch_update', array(
					'smilieIds' => $smilieIds,
					'totalSmilies' => $totalSmilies,
					'categoryOptions' => $categoryModel->getCategoryOptions()
				));
			}
		}
		else
		{
			return $this->responseRedirect(
				XenForo_ControllerResponse_Redirect::SUCCESS,
				XenForo_Link::buildAdminLink('smilies')
			);
		}
	}

	public function SmileyManager_actionSave(XenForo_DataWriter_Smilie $dw)
	{
		$categoryId = $this->_input->filterSingle('smilie_category_id', XenForo_Input::UINT);
		$displayOrder = $this->_input->filterSingle('smilie_display_order', XenForo_Input::UINT);

		$dw->set('smilie_category_id', $categoryId);
		$dw->set('smilie_display_order', $displayOrder);
	}

	protected function _getCategoryModel()
	{
		return $this->getModelFromCache('Milano_SmileyManager_Model_Category');
	}
}