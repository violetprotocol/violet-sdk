import { mode } from "../lib";

type PopupOptions = {
  mode: typeof mode.POPUP;
  focus?: boolean;
};

const WIDTH = 960;
const HEIGHT = 800;

const popupFeatures = `
  toolbar=no,
  location=no,
  directories=no,
  status=no,
  menubar=no,
  scrollbars=no,
  resizable=no,
  copyhistory=no,
  width=${WIDTH}},
  height=${HEIGHT}
`;

const generatePopup = ({
  url,
  id,
  options,
}: {
  url: string;
  id: string;
  options?: PopupOptions;
}) => {
  const popup = window.open(url, id, popupFeatures);

  if (popup && options?.focus) popup.focus();

  return popup;
};

export { generatePopup };
