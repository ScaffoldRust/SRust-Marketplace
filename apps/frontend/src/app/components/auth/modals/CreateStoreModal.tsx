"use client";

import CreateStoreForm from "../forms/CreateStoreForm";
import AuthModal from "../ui/AuthModal";

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateStoreModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateStoreModalProps) {
  return (
    <AuthModal isOpen={isOpen} onClose={onClose} maxWidth="sm:max-w-[550px]">
      <CreateStoreForm onSuccess={onSuccess} />
    </AuthModal>
  );
}
