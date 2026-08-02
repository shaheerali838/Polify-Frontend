import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { uiElementStyles as s } from "../assets/dummyStyles.jsx";
import useClickOutside from "../hooks/useClickoutside.js";

const btnStyles = {
  primary: s.btnPrimary,
  ghost: s.btnGhost,
  danger: s.btnDanger,
};

export function Button({ variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`${s.btnBase} ${btnStyles[variant]} ${className}`}
      {...props}
    />
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  confirmVariant = "danger",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl shadow-zinc-300/50 dark:shadow-black/40">
        <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-800 dark:text-zinc-400">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export const inputCls = s.inputCls;
export const authInputCls = inputCls;

export function AuthButton({ className = "", ...props }) {
  return <button className={`${s.authButton} ${className}`} {...props} />;
}

export function Field({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className={s.fieldLabel}>{label}</span>}
      <input className={`${inputCls} ${className}`} {...props} />
    </label>
  );
}

export function SelectField({
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selected =
    options.find((option) => option.value === value) || options[0];

  useClickOutside(containerRef, () => setOpen(false), open);

  const selectOption = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  const moveSelection = (direction) => {
    const index = options.findIndex((option) => option.value === value);
    const nextIndex = Math.min(
      options.length - 1,
      Math.max(0, (index < 0 ? 0 : index) + direction),
    );
    selectOption(options[nextIndex].value);
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") return setOpen(false);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (open) moveSelection(1);
      else setOpen(true);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (open) moveSelection(-1);
      else setOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onKeyDown}
        className="flex w-full items-center justify-between rounded-2xl border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-left text-sm text-zinc-950 dark:text-zinc-100 shadow-sm outline-none transition hover:border-zinc-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          aria-hidden="true"
          size={18}
          className={`ml-3 shrink-0 text-zinc-500 dark:text-zinc-800 dark:text-zinc-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="dropdown-scrollbar absolute z-30 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1.5 shadow-2xl shadow-zinc-300/50 dark:shadow-black/40"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectOption(option.value)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  isSelected
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <Check aria-hidden="true" size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Avatar({ user = {}, className = "w-10 h-10" }) {
  if (user?.avatar)
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${className} ${s.avatarImg}`}
      />
    );
  return (
    <div className={`${className} ${s.avatarPlaceholder}`}>
      {user?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

export function PollSkeleton({ count = 3 }) {
  return (
    <div className={s.skeletonContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={s.skeletonCard}>
          <div className="flex items-center gap-2 mb-3">
            <div className={s.skeletonAvatar} />
            <div className={s.skeletonName} />
            <div className={s.skeletonUsername} />
            <div className={s.skeletonCategory} />
          </div>
          <div className={s.skeletonQuestion} />
          <div className={s.skeletonOptions}>
            <div className={s.skeletonOption1} />
            <div className={s.skeletonOption2} />
          </div>
          <div className={s.skeletonFooter}>
            <div className={s.skeletonAction1} />
            <div className={s.skeletonAction2} />
            <div className={s.skeletonAction3} />
          </div>
        </div>
      ))}
    </div>
  );
}
