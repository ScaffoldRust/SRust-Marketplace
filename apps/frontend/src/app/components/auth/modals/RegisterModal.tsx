"use client";

import RegisterForm from "../forms/RegisterForm";
import AuthModal from "../ui/AuthModal";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onLoginClick: () => void;
}

export default function RegisterModal({
  isOpen,
  onClose,
  onSuccess,
  onLoginClick,
}: RegisterModalProps) {
  return (
    <AuthModal isOpen={isOpen} onClose={onClose}>
      <RegisterForm onSuccess={onSuccess} onLoginClick={onLoginClick} />
    </AuthModal>
  );
}
