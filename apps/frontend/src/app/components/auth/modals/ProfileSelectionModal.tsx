"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import AuthModal from "../ui/AuthModal";
import ProfileOption from "../ui/ProfileOption";

interface ProfileSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBuyer: () => void;
  onSelectSeller: () => void;
}

export default function ProfileSelectionModal({
  isOpen,
  onClose,
  onSelectBuyer,
  onSelectSeller,
}: ProfileSelectionModalProps) {
  return (
    <AuthModal isOpen={isOpen} onClose={onClose} maxWidth="sm:max-w-[600px]">
      <DialogHeader className="pb-2">
        <DialogTitle className="text-2xl font-bold text-center">
          Choose your profile
        </DialogTitle>
        <DialogDescription className="text-center text-zinc-400">
          Select how you want to use StellarMarket marketplace
        </DialogDescription>
      </DialogHeader>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <ProfileOption
          title="Buyer"
          description="Shop from unique stores and collect NFTs with every purchase"
          features={[
            "Browse thousands of products",
            "Earn collectible NFTs",
            "Secure blockchain payments",
          ]}
          icon="shopping-bag"
          buttonText="Continue as Buyer"
          onClick={onSelectBuyer}
        />

        <ProfileOption
          title="Seller"
          description="Open your store and start selling to crypto-savvy customers"
          features={[
            "Create your own store",
            "Manage products & orders",
            "Milestone NFT rewards",
          ]}
          icon="store"
          buttonText="Continue as Seller"
          onClick={onSelectSeller}
        />
      </div>
    </AuthModal>
  );
}
