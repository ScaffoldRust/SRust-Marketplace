"use client";

import LoginForm from "../forms/LoginForm";
import AuthModal from "../ui/AuthModal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onRegisterClick: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  onRegisterClick,
}: LoginModalProps) {
  return (
    <AuthModal isOpen={isOpen} onClose={onClose}>
      <LoginForm onSuccess={onSuccess} onRegisterClick={onRegisterClick} />
    </AuthModal>
  );
}
