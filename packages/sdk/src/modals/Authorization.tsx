import { useModal } from "../stores";

type Metadata = {
  url: string;
};

const isMetadata = (metadata: unknown): metadata is Metadata => {
  if (typeof metadata !== "object") return false;

  if (!metadata) return false;

  if (!("url" in metadata)) return false;

  return true;
};

const Authorization = ({ isOpen }: { isOpen: boolean }) => {
  const { setOpenModal, metadata } = useModal((state) => ({
    setOpenModal: state.setOpenModal,
    metadata: state.metadata,
  }));

  if (!isMetadata(metadata)) return null;

  if (!isOpen) return null;

  return (
    <iframe
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
      }}
      src={metadata.url}
    />
  );
};

export { Authorization };
