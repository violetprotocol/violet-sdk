import { useModal, modalName } from "../stores";

import { Authorization } from "./Authorization";

const Modals = () => {
  const { openModal } = useModal((state) => ({
    openModal: state.openModal,
  }));

  return (
    <>
      <Authorization isOpen={openModal === modalName.AUTHORIZATION} />
    </>
  );
};

export default Modals;
