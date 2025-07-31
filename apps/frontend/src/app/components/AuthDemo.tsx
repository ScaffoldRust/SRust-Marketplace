"use client";

import { useState } from "react";
import ProfileSelectionModal from "./auth/modals/ProfileSelectionModal";
import LoginModal from "./auth/modals/LoginModal";
import RegisterModal from "./auth/modals/RegisterModal";
import CreateStoreModal from "./auth/modals/CreateStoreModal";
import { Button } from "./ui/button";

export default function AuthDemo() {
  const [showProfileSelection, setShowProfileSelection] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [userType, setUserType] = useState<"buyer" | "seller" | null>(null);

  const handleProfileSelect = (type: "buyer" | "seller") => {
    setUserType(type);
    setShowProfileSelection(false);
    setShowRegister(true);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    if (userType === "seller") {
      setShowCreateStore(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  const handleCreateStoreSuccess = () => {
    setShowCreateStore(false);
  };

  const toggleLoginRegister = () => {
    setShowLogin(!showLogin);
    setShowRegister(!showRegister);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      <h1 className="text-2xl font-bold mb-4">StellarMarket Auth Demo</h1>

      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          onClick={() => setShowProfileSelection(true)}
          className="bg-white hover:bg-zinc-200 text-black font-medium"
        >
          Sign Up
        </Button>

        <Button
          onClick={() => setShowLogin(true)}
          variant="outline"
          className="border-white text-black hover:bg-white/10"
        >
          Login
        </Button>
      </div>

      {/* Modals */}
      <ProfileSelectionModal
        isOpen={showProfileSelection}
        onClose={() => setShowProfileSelection(false)}
        onSelectBuyer={() => handleProfileSelect("buyer")}
        onSelectSeller={() => handleProfileSelect("seller")}
      />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
        onRegisterClick={toggleLoginRegister}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSuccess={handleRegisterSuccess}
        onLoginClick={toggleLoginRegister}
      />

      <CreateStoreModal
        isOpen={showCreateStore}
        onClose={() => setShowCreateStore(false)}
        onSuccess={handleCreateStoreSuccess}
      />
    </div>
  );
}
