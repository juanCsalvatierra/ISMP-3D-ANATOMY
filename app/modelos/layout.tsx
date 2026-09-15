"use client";
import { RoleGate } from "@/app/components/auth/RoleGate";

export default function ModelosLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowedRoles={["estudiante", "docente", "admin"]}>
      {children}
    </RoleGate>
  );
}
