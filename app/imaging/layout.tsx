"use client";
import { RoleGate } from "@/app/components/auth/RoleGate";

export default function ImagingLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowedRoles={["estudiante", "docente", "admin"]}>
      {children}
    </RoleGate>
  );
}
