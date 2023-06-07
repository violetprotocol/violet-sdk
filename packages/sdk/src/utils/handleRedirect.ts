const handleRedirect = ({ url }: { url: string }) => {
  window.location.replace(url);
};

export { handleRedirect };
