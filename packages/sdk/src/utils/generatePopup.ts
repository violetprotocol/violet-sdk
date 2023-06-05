import { mode } from "../lib";

type PopupOptions = {
  mode: typeof mode.POPUP;
  focus?: boolean;
};

const popupFeatures = `
  toolbar=no,
  location=no,
  directories=no,
  status=no,
  menubar=no,
  scrollbars=no,
  resizable=no,
  copyhistory=no,
  width=600,
  height=800
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
