import React from "react";

type BrandLogoVariant = "default" | "sidebar" | "mobile" | "footer" | "auth";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  showText?: boolean;
  className?: string;
  textClassName?: string;
  circular?: boolean;
}

const variantStyles: Record<BrandLogoVariant, { logo: string; container: string; circle: string }> = {
  default: {
    container: "flex items-center gap-2.5",
    logo: "h-9 w-9",
    circle: "h-10 w-10",
  },
  sidebar: {
    container: "flex items-center gap-3",
    logo: "h-8 w-8",
    circle: "h-10 w-10",
  },
  mobile: {
    container: "flex items-center gap-2.5",
    logo: "h-8 w-8",
    circle: "h-10 w-10",
  },
  footer: {
    container: "flex items-center gap-2.5",
    logo: "h-8 w-8",
    circle: "h-10 w-10",
  },
  auth: {
    container: "flex items-center gap-3",
    logo: "h-10 w-10",
    circle: "h-12 w-12",
  },
};

export function BrandLogo({
  variant = "default",
  showText = true,
  className = "",
  textClassName = "",
  circular = false,
}: BrandLogoProps) {
  const styles = variantStyles[variant];

  if (circular) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div
          className={`${styles.circle} rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 ring-1 ring-blue-100/60 dark:from-gray-800 dark:to-gray-700 dark:ring-gray-700 shrink-0`}
        >
          <img
            src="/logo.png"
            alt="Amplizo"
            className={`${styles.logo} object-contain select-none`}
            draggable={false}
          />
        </div>
        {showText && (
          <span className={`font-bold tracking-tight ${textClassName}`}>Amplizo</span>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <img
        src="/logo.png"
        alt="Amplizo"
        className={`${styles.logo} object-contain select-none`}
        draggable={false}
      />
      {showText && (
        <span className={`font-bold tracking-tight ${textClassName}`}>Amplizo</span>
      )}
    </div>
  );
}
