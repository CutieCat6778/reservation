import { useEffect } from "react";

interface Props {
  message: string | null;
  onClose: () => void;
}

export default function NotificationToast({ message, onClose }: Props) {
  useEffect(() => {
    if (message) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="alert alert-success shadow-lg">{message}</div>
    </div>
  );
}
