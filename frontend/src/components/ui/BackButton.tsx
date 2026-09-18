"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BackButtonProps {
  fallback?: string;
  label?: string;
  className?: string;
}

export function BackButton({ fallback, label = "Back", className = "" }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (fallback) {
      router.push(fallback);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="md"
      onClick={handleClick}
      className={`gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
