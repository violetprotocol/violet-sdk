/**
 * Determines if the current page is in an iframe element.
 *
 * @return bool True if the frame is in an iframe; otherwise, false.
 */
const checkWindowInIframe = (window: Window) => {
  if (window.location === window.parent.location) return false;

  if (window.self === window.top) return false;

  if (!window.frameElement) return false;

  return true;
};

export { checkWindowInIframe };
