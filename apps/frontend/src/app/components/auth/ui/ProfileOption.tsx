"use client";

import { ShoppingBag, Store } from "lucide-react";
import FeaturesList from "./FeaturesList";
import { Button } from "../../ui/button";

interface ProfileOptionProps {
  title: string;
  description: string;
  features: string[];
  icon: "shopping-bag" | "store";
  buttonText: string;
  onClick: () => void;
}

export default function ProfileOption({
  title,
  description,
  features,
  icon,
  buttonText,
  onClick,
}: ProfileOptionProps) {
  return (
    <div className="flex flex-col h-full p-6 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-white/50 transition-colors">
      <div className="mb-4">
        {icon === "shopping-bag" ? (
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Store className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm mb-4">{description}</p>

      <FeaturesList features={features} />

      <div className="mt-auto pt-4">
        <Button
          onClick={onClick}
          className="w-full bg-white hover:bg-zinc-200 text-black font-medium"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
