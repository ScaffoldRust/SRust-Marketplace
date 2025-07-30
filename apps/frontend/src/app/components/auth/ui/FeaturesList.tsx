import { Check } from "lucide-react";

interface FeaturesListProps {
  features: string[];
}

export default function FeaturesList({ features }: FeaturesListProps) {
  return (
    <ul className="space-y-2 mb-4">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <div className="mr-2 mt-0.5">
            <Check className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm text-zinc-300">{feature}</span>
        </li>
      ))}
    </ul>
  );
}
