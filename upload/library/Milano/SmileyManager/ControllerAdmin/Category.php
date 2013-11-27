<?php

class Milano_SmileyManager_ControllerAdmin_Category extends XenForo_ControllerAdmin_Abstract
{
	protected function _preDispatch($action)
	{
		$this->assertAdminPermission('bbCodeSmilie');
	}

	public function actionIndex()
	{
		if ($this->_input->filterSingle('smilie_category_id', XenForo_Input::UINT))
		{
			return $this->responseReroute(__CLASS__, 'view');
		}
		
		$viewParams = array(
			'categories' => $this->_getCategoryModel()->getAllCategories()
		);
		return $this->responseView('Milano_SmileyManager_ViewAdmin_List', 'SmileyManager_category_list', $viewParams);
	}

	public function actionView()
	{
		$category = $this->_getCategoryOrError();
		$smilieModel = $this->_getSmilieModel();

		if ($this->isConfirmedPost())
		{

			/*$input = $this->_input->filter(array(
				'smilie_category_id' => XenForo_Input::UINT,
				'order' => XenForo_Input::STRING
			));*/
			$orderInput = $this->_input->filterSingle('order', XenForo_Input::STRING);

			$order = explode(',', $orderInput);

			$db = XenForo_Application::get('db');
    		XenForo_Db::beginTransaction($db);

			$start = microtime(true);
			$limit = 60;

			if ($order)
			{
				foreach ($order as $key => $smilieId) 
				{
					$dw = XenForo_DataWriter::create('XenForo_DataWriter_Smilie', XenForo_DataWriter::ERROR_SILENT);
		        	$dw->setOption(Milano_SmileyManager_DataWriter_Smilie::OPTION_REBUILD_CATEGORY_CACHE, false);
		            $dw->setExistingData($smilieId);
		            $dw->set('smilie_display_order', $key + 1);

		            $dw->save();

		            if ($limit && microtime(true) - $start > $limit)
					{
						break;
					}
				}
			}

			XenForo_Db::commit($db);

			return $this->responseRedirect(
				XenForo_ControllerResponse_Redirect::SUCCESS,
				XenForo_Link::buildAdminLink('smilie-categories', $category)
			); 
		}
		else
		{
			$smilies = $smilieModel->getSmilies(array('smilie_category_id' => $category['smilie_category_id']));

			$viewParams = array(
				'category' => $category,
				'categories' => $this->_getCategoryModel()->getCategories(false),

				'smilies' => $smilieModel->prepareSmiliesForList($smilies),

				'sortable' => true
			);

			return $this->responseView('Milano_SmileyManager_ViewAdmin_List', 'SmileyManager_category_view', $viewParams);
		}
	}

	protected function _getCategoryAddEditResponse(array $category)
	{
		$viewParams = array(
			'category' => $category
		);
		return $this->responseView('Milano_SmileyManager_ViewAdmin_Edit', 'SmileyManager_category_edit', $viewParams);
	}

	public function actionAdd()
	{
		if ($this->_input->filterSingle('smilie_category_id', XenForo_Input::UINT))
		{
			return $this->responseReroute(__CLASS__, 'addSmilies');
		}

		return $this->_getCategoryAddEditResponse(array(
			'display_order' => 1,
			'active' => 1
		));
	}

	public function actionEdit()
	{
		$category = $this->_getCategoryOrError();

		return $this->_getCategoryAddEditResponse($category);
	}

	public function actionSave()
	{
		$this->_assertPostOnly();

		$categoryId = $this->_input->filterSingle('smilie_category_id', XenForo_Input::STRING);

		$dwInput = $this->_input->filter(array(
			'category_title' => XenForo_Input::STRING,
			'display_order' => XenForo_Input::UINT,
			'active' => XenForo_Input::UINT
		));

		$dw = XenForo_DataWriter::create('Milano_SmileyManager_DataWriter_Category');
		if ($categoryId)
		{
			$dw->setExistingData($categoryId);
		}
		$dw->bulkSet($dwInput);
		$dw->save();

		return $this->responseRedirect(
			XenForo_ControllerResponse_Redirect::SUCCESS,
			XenForo_Link::buildAdminLink('smilie-categories') . $this->getLastHash($dw->get('smilie_category_id'))
		);
	}

	public function actionAddSmilies()
	{
		$category = $this->_getCategoryOrError();
		$smilieModel = $this->_getSmilieModel();

		$smilies = $smilieModel->getSmilies(array('smilie_category_id_not' => $category['smilie_category_id']));

		$viewParams = array(
			'category' => $category,
			'update' => 1,

			'smilies' => $smilieModel->prepareSmiliesForList($smilies)
		);
		return $this->responseView('Milano_SmileyManager_ViewAdmin_AddSmilie', 'SmileyManager_category_view', $viewParams);
	}

	public function actionUpdate()
	{
		$this->_assertPostOnly();

		$category = $this->_getCategoryOrError();
		$smilieIds = $this->_input->filterSingle('smilie_ids', XenForo_Input::JSON_ARRAY);

		if ($smilieIds)
		{
			$this->_getSmilieModel()->updateSmiliesToCategory($smilieIds, $category['smilie_category_id']);
		}

		return $this->responseRedirect(
            XenForo_ControllerResponse_Redirect::SUCCESS,
            XenForo_Link::buildAdminLink('smilie-categories', $category)
        );
	}

	public function actionToggle()
	{
		return $this->_getToggleResponse(
			$this->_getCategoryModel()->getAllCategories(),
			'Milano_SmileyManager_DataWriter_Category',
			'smilie-categories');
	}

	public function actionDelete()
	{
		if ($this->isConfirmedPost())
		{
			$categoryId = $this->_input->filterSingle('smilie_category_id', XenForo_Input::UINT);

			$dw = XenForo_DataWriter::create('Milano_SmileyManager_DataWriter_Category');

			if ($this->_input->filterSingle('move_child_smilies', XenForo_Input::UINT))
			{
				$dw->setOption(Milano_SmileyManager_DataWriter_Category::OPTION_MOVE_SMILIE_CATEGORY_ID, $this->_input->filterSingle('new_category_id', XenForo_Input::UINT));
			}

			$dw->setExistingData($categoryId);
            $dw->delete();

            return $this->responseRedirect(
                XenForo_ControllerResponse_Redirect::SUCCESS,
                XenForo_Link::buildAdminLink('smilie-categories')
            );
		}
		else
		{
			$category = $this->_getCategoryOrError();

			$viewParams = array(
				'category' => $category,
				'categoryOptions' => $this->_getCategoryModel()->getCategoryOptions($category['smilie_category_id'])
			);
			return $this->responseView('Milano_SmileyManager_ViewAdmin_Delete', 'SmileyManager_category_delete', $viewParams);
		}
	}

	public function actionImport()
	{
		// To do: overwrite existing smilies
		$categoryId = $this->_input->filterSingle('smilie_category_id', XenForo_Input::UINT);
		$new = $this->_input->filterSingle('new', XenForo_Input::UINT);

		if (!$categoryId && !$new)
		{
			$viewParams = array(
				'categoryOptions' => $this->_getCategoryModel()->getCategoryOptions()
			);
			return $this->responseView('Milano_SmileyManager_ViewAdmin_ChooseCategory', 'SmileyManager_choose_category', $viewParams);
		}
		else
		{
			if ($this->isConfirmedPost())
			{
				$fileTransfer = new Zend_File_Transfer_Adapter_Http();
				if ($fileTransfer->isUploaded('upload_file'))
				{
					$fileInfo = $fileTransfer->getFileInfo('upload_file');
					$fileName = $fileInfo['upload_file']['tmp_name'];
				}
				else
				{
					$fileName = $this->_input->filterSingle('server_file', XenForo_Input::STRING);
				}

				$this->_getSmilieModel()->importSmileyXmlFromFile($fileName, $categoryId);

				return $this->responseRedirect(
					XenForo_ControllerResponse_Redirect::SUCCESS,
					XenForo_Link::buildAdminLink('smilies')
				);
			}
			else
			{
				$viewParams = array(
					'categoryId' => $categoryId,
					'new' => $new
				);
				return $this->responseView('Milano_SmileyManager_ViewAdmin_Import', 'SmileyManager_import', $viewParams);
			}
		}
	}

	public function actionExport()
	{
		$category = $this->_getCategoryOrError();

		$this->_routeMatch->setResponseType('xml');

		$smilies = $this->_getSmilieModel()->getSmilies(array('smilie_category_id' => $category['smilie_category_id']));
		$this->_getCategoryModel()->updateSmilieCount($category['smilie_category_id']);

		$viewParams = array(
			'category' => $category,
			'xml' => $this->_getSmilieModel()->getSmileyXml($category, $smilies)
		);

		return $this->responseView('Milano_SmileyManager_ViewAdmin_Export', '', $viewParams);
	}

	protected function _getCategoryOrError($id = null)
	{
		if ($id === null)
		{
			$id = $this->_input->filterSingle('smilie_category_id', XenForo_Input::UINT);
		}

		$info = $this->_getCategoryModel()->getCategoryById($id);
		if (!$info)
		{
			throw $this->responseException($this->responseError(new XenForo_Phrase('requested_category_not_found'), 404));
		}

		return $info;
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