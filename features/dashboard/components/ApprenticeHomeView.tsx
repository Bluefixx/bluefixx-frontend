"use client";

import React from "react";
import { TalentHomeView } from "./talent/TalentHomeView";

interface ApprenticeHomeViewProps {
  onSwitchToCustomer?: () => void;
  onOpenRoleSwitcher?: () => void;
}

export default function ApprenticeHomeView({
  onSwitchToCustomer,
  onOpenRoleSwitcher,
}: ApprenticeHomeViewProps) {
  return (
    <TalentHomeView
      onSwitchToCustomer={onSwitchToCustomer}
      onOpenRoleSwitcher={onOpenRoleSwitcher}
    />
  );
}
