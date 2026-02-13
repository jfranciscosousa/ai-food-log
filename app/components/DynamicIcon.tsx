import { icons } from "lucide-react";
import type { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  // @ts-expect-error - Dynamic icon lookup
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    // Fallback to UtensilsCrossed if icon not found
    return <icons.UtensilsCrossed {...props} />;
  }

  return <LucideIcon {...props} />;
}
