/*
 * FREONN TENDER BUTTON — Переиспользуемая кнопка "Пригласить в тендер"
 * Варианты: primary (синий), ghost (контурный), outline-light (для тёмного фона)
 */
import { useState } from "react";
import { FileText } from "lucide-react";
import TenderModal from "./TenderModal";
import { ymGoal } from "@/lib/ym";
import { gaEvent } from "@/lib/ga";

interface TenderButtonProps {
  variant?: "primary" | "ghost" | "outline-light" | "outline-dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export default function TenderButton({
  variant = "primary",
  size = "md",
  className = "",
  label = "Пригласить в тендер",
}: TenderButtonProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    ymGoal("tender_open", { source: "button" });
    gaEvent("tender_open", { event_category: "lead", event_label: "tender_button" });
    setOpen(true);
  };

  const sizeMap = {
    sm: { padding: "0.5rem 1rem", fontSize: "0.72rem", iconSize: 13 },
    md: { padding: "0.75rem 1.5rem", fontSize: "0.8rem", iconSize: 15 },
    lg: { padding: "0.9rem 2rem", fontSize: "0.9rem", iconSize: 17 },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, #2B3A8F 0%, #1e2a6e 100%)",
      color: "white",
      border: "none",
      boxShadow: "0 4px 16px rgba(43,58,143,0.35)",
    },
    ghost: {
      background: "transparent",
      color: "#1A1A2E",
      border: "1px solid rgba(43,58,143,0.4)",
    },
    "outline-light": {
      background: "transparent",
      color: "rgba(240,240,240,0.85)",
      border: "1px solid rgba(255,255,255,0.2)",
    },
    "outline-dark": {
      background: "transparent",
      color: "#2B3A8F",
      border: "1px solid rgba(43,58,143,0.5)",
    },
  };

  const hoverStyles: Record<string, React.CSSProperties> = {
    primary: { background: "linear-gradient(135deg, #3a4db8 0%, #2B3A8F 100%)", transform: "translateY(-1px)", boxShadow: "0 8px 24px rgba(43,58,143,0.45)" },
    ghost: { borderColor: "rgba(43,58,143,0.8)", color: "#2B3A8F", background: "rgba(43,58,143,0.06)" },
    "outline-light": { borderColor: "rgba(255,255,255,0.5)", color: "white", background: "rgba(255,255,255,0.05)" },
    "outline-dark": { borderColor: "#2B3A8F", background: "rgba(43,58,143,0.08)" },
  };

  const { padding, fontSize, iconSize } = sizeMap[size];
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <button
        onClick={handleOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding,
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 0.2s ease",
          borderRadius: "0.75rem",
          ...(hovered ? hoverStyles[variant] : variantStyles[variant]),
        }}
        aria-label={label}
      >
        <FileText size={iconSize} />
        {label}
      </button>

      <TenderModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
