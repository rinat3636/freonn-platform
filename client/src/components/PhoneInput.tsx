/*
 * PhoneInput — маска +7 (___) ___-__-__
 * Префикс +7 зафиксирован и не удаляется
 */
import { useRef } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
  "aria-label"?: string;
}

function formatPhone(raw: string): string {
  // Strip everything except digits
  const digits = raw.replace(/\D/g, "");
  // Remove leading 7 or 8 if present (we always prepend +7)
  const local = digits.startsWith("7") || digits.startsWith("8") ? digits.slice(1) : digits;
  const d = local.slice(0, 10);
  let result = "+7";
  if (d.length > 0) result += " (" + d.slice(0, 3);
  if (d.length >= 3) result += ") " + d.slice(3, 6);
  if (d.length >= 6) result += "-" + d.slice(6, 8);
  if (d.length >= 8) result += "-" + d.slice(8, 10);
  return result;
}

export default function PhoneInput({
  value,
  onChange,
  className = "",
  style = {},
  onFocus,
  onBlur,
  required,
  id,
  name,
  autoComplete = "tel",
  "aria-label": ariaLabel,
}: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onChange(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = inputRef.current;
    if (!input) return;
    // Prevent deleting the +7 prefix (first 2 chars)
    const selStart = input.selectionStart ?? 0;
    const selEnd = input.selectionEnd ?? 0;
    if (
      (e.key === "Backspace" && selStart <= 2 && selEnd <= 2) ||
      (e.key === "Delete" && selStart < 2)
    ) {
      e.preventDefault();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // If empty, set to +7 and place cursor after it
    if (!value || value === "") {
      onChange("+7 ");
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(3, 3);
        }
      }, 0);
    }
    onFocus?.(e);
  };

  return (
    <input
      ref={inputRef}
      id={id}
      name={name || id}
      type="tel"
      inputMode="tel"
      autoComplete={autoComplete}
      placeholder="+7 (___) ___-__-__"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={onBlur}
      required={required}
      className={className}
      style={style}
      maxLength={18}
      aria-label={ariaLabel}
    />
  );
}
