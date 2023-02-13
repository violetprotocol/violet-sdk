import { create } from "zustand";

const modalName = {
  AUTHORIZATION: "AUTHORIZATION",
} as const;

type ModalName = (typeof modalName)[keyof typeof modalName];

type Metadata = Record<string, unknown>;

type ModalState = {
  openModal?: ModalName;
  metadata?: Metadata;
  setOpenModal: (
    modal: { name: ModalName; metadata?: Metadata } | null
  ) => void;
};

const useModal = create<ModalState>()((set) => ({
  openModal: undefined,
  metadata: undefined,
  setOpenModal: (modal) => {
    if (!modal) {
      set({}, true);

      return;
    }

    set(() => ({ openModal: modal.name, metadata: modal.metadata }));
  },
}));

export type { ModalName, Metadata };

export { modalName, useModal };
