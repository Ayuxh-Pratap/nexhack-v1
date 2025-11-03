import { useRef, useEffect, ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
  title: string;
  open: boolean;
  setOpen: (x: boolean) => void;
  icon?: ReactNode;
};

const Modal = ({ children, title, open, setOpen, icon }: ModalProps) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Close modal on Escape key
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (!open || e.key !== "Escape") return;
      setOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [open, setOpen]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      {/* Modal content */}
      <div className="relative z-20 flex min-h-full justify-center p-4 text-center items-center sm:p-0 w-full">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {icon && (
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  {icon}
                </div>
              )}
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">{children}</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={() => setOpen(false)}
              ref={cancelButtonRef}
              autoFocus
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
