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

	public function SmileyManager_actionSave(XenForo_DataWriter_Smilie $dw)
	{
		$categoryId = $this->_input->filterSingle('smilie_category_id', XenForo_Input::UINT);
		$displayOrder = $this->_input->filterSingle('smilie_display_order', XenForo_Input::UINT);

		$dw->set('smilie_category_id', $categoryId);
		$dw->set('smilie_display_order', $displayOrder);
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

	public function actionBulkAdd()
	{
		$input = $this->_input->filter(array(
			'data_source' => XenForo_Input::STRING,
			'type' => XenForo_Input::STRING
		));

		if ($this->isConfirmedPost())
		{
			if (!$input['data_source'])
			{
				throw $this->responseException($this->responseError(new XenForo_Phrase('SmileyManager_image_path_directory_not_empty')));
			}

			$smilieModel = $this->_getSmilieModel();
			$smilies = array();

			if ($input['type'] == 'directory')
			{
				if (!file_exists($input['data_source']))
				{
					throw $this->responseException($this->responseError(new XenForo_Phrase('SmileyManager_directory_not_found'), 404));
				}
				$images = $smilieModel->getImagesFromDirectory($input['data_source']);
				if (empty($images))
				{
					throw $this->responseException($this->responseError(new XenForo_Phrase('SmileyManager_directory_empty'), 404));
				}
				foreach ($images as $key => &$image) 
				{
					$info = pathinfo($image);
					$smilies[$key] = array(
						'path' => $image,
						'filename' => $info['filename']
					);
				}
			}
			else if ($input['type'] == 'sprite')
			{
				if (!file_exists($input['data_source']))
				{
					throw $this->responseException($this->responseError(new XenForo_Phrase('SmileyManager_sprite_not_found'), 404));
				}
			}
			else
			{
				return $this->responseRedirect(
					XenForo_ControllerResponse_Redirect::SUCCESS,
					XenForo_Link::buildAdminLink('smilies/bulk-add')
				);
			}

			$viewParams = array(
				'type' => $input['type'],
				'dataSource' => $input['data_source'],

				'categoryOptions' => $this->_getCategoryModel()->getCategoryOptions(),
				'smilies' => $smilies
			);

			return $this->responseView('Milano_SmileyManager_ViewAdmin_BulkAdd', 'SmileyManager_smilie_bulk_add', $viewParams);
		}
		else
		{
			return $this->responseView('Milano_SmileyManager_ViewAdmin_ChooseType', 'SmileyManager_bulk_add_type', array());
		}
	}

	public function actionBulkSave()
	{
		$this->_assertPostOnly();

		$input = $this->_input->filter(array(
			'smilies' => XenForo_Input::ARRAY_SIMPLE,
			'smilie_category_id' => XenForo_Input::UINT,
			'type' => XenForo_Input::STRING
		));

		$category = $this->_getCategoryModel()->getCategoryById($input['smilie_category_id']);

		foreach ($input['smilies'] as &$smilie) 
		{
			if ($input['type'] == 'sprite')
			{
				$smilie['sprite_mode'] = 1;
				$smilie['image_url'] = $this->_input->filterSingle('data_source', XenForo_Input::STRING);
			}
			$smilie['smilie_category_id'] = $input['smilie_category_id'];
		}

		$this->_getSmilieModel()->createSmilies($input['smilies']);

		$redirect = XenForo_Link::buildAdminLink('smilies');
		if ($category)
		{
			$redirect = XenForo_Link::buildAdminLink('smilie-categories', $category);
		}

		return $this->responseRedirect(
			XenForo_ControllerResponse_Redirect::SUCCESS,
			$redirect
		);
	}

	public function actionSprite()
	{
		$this->_assertPostOnly();

		$input = $this->_input->filter(array(
			'data_source' => XenForo_Input::STRING,
			'key' => XenForo_Input::UINT,
			'width' => XenForo_Input::UINT,
			'height' => XenForo_Input::UINT,
			'x' => XenForo_Input::STRING,
			'y' => XenForo_Input::STRING
		));

		$viewParams = array(
			'i' => $input['key'],
			'dataSource' => $input['data_source'],
			'sprite_params' => array(
				'w' => $input['width'],
				'h' => $input['height'],
				'x' => $input['x'],
				'y' => $input['y']
			) 
		);

		return $this->responseView('Milano_SmileyManager_ViewAdmin_Template', 'SmileyManager_smilie_bulk_add_item', $viewParams);
	}

	protected function _getCategoryModel()
	{
		return $this->getModelFromCache('Milano_SmileyManager_Model_Category');
	}
}