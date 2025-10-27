"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

interface PhoneModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const PhoneModalContext = createContext<PhoneModalContextType | undefined>(
  undefined,
);

interface PhoneModalProviderProps {
  children: ReactNode;
}

export function PhoneModalProvider({ children }: PhoneModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <PhoneModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </PhoneModalContext.Provider>
  );
}

export function usePhoneModal() {
  const context = useContext(PhoneModalContext);
  if (context === undefined) {
    throw new Error("usePhoneModal must be used within a PhoneModalProvider");
  }
  return context;
}
