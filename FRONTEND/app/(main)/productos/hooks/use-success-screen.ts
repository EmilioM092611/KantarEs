import { useState } from "react";

interface SuccessMessage {
  title: string;
  description: string;
}

export function useSuccessScreen() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<SuccessMessage>({
    title: "",
    description: "",
  });

  const show = (title: string, description: string, duration = 2500) => {
    setMessage({ title, description });
    setIsOpen(true);

    if (duration > 0) {
      setTimeout(() => {
        setIsOpen(false);
      }, duration);
    }
  };

  const hide = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    message,
    show,
    hide,
    setIsOpen,
  };
}
