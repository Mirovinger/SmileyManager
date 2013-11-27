<?php

/**
 * Route prefix handler for smilie categories in the admin control panel.
 */
class Milano_SmileyManager_Route_PrefixAdmin_Categories extends XenForo_Route_PrefixAdmin_Nodes
{
	/**
	 * Match a specific route for an already matched prefix.
	 *
	 * @see XenForo_Route_Interface::match()
	 */
	public function match($routePath, Zend_Controller_Request_Http $request, XenForo_Router $router)
	{
		$action = $router->resolveActionWithIntegerParam($routePath, $request, 'smilie_category_id');
		return $router->getRouteMatch('Milano_SmileyManager_ControllerAdmin_Category', $action, 'SmileyManagerCategories');
	}

	/**
	 * Method to build a link to the specified page/action with the provided
	 * data and params.
	 *
	 * @see XenForo_Route_BuilderInterface
	 */
	public function buildLink($originalPrefix, $outputPrefix, $action, $extension, $data, array &$extraParams)
	{
		return XenForo_Link::buildBasicLinkWithIntegerParam($outputPrefix, $action, $extension, $data, 'smilie_category_id', 'category_title');
	}
}