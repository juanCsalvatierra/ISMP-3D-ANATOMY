"use client";
import { useRouter } from "next/navigation";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { CuestionarioForm } from "@/app/components/cuestionarios/CuestionarioForm";
import { useUserStore } from "@/app/store/userStore";
import { useCuestionarioBankStore } from "@/app/store/cuestionarioBankStore";

function NuevoView() {
  const router = useRouter();
  const currentUser = useUserStore((s) => s.currentUser)!;
  const create = useCuestionarioBankStore((s) => s.create);

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "calc(100vh - 48px)" }}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1
          className="text-2xl font-semibold mb-2"
          style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
        >
          Nuevo cuestionario
        </h1>
        <p
          className="text-sm mb-8"
          style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
        >
          Definí el cuestionario para una materia y agregá sus preguntas.
        </p>

        <CuestionarioForm
          autorId={currentUser.id}
          autorNombre={currentUser.name}
          onSubmit={(input) => {
            create(input);
            router.push("/docente");
          }}
          onCancel={() => router.push("/docente")}
        />
      </div>
    </main>
  );
}

export default function NuevoCuestionarioPage() {
  return (
    <RoleGate allowedRoles={["docente", "admin"]}>
      <NuevoView />
    </RoleGate>
  );
}
