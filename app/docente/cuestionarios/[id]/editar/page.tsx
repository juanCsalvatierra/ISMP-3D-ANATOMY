"use client";
import { use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { CuestionarioForm } from "@/app/components/cuestionarios/CuestionarioForm";
import { useUserStore } from "@/app/store/userStore";
import { useCuestionarioBankStore, getById } from "@/app/store/cuestionarioBankStore";

function EditarView({ id }: { id: string }) {
  const router = useRouter();
  const currentUser = useUserStore((s) => s.currentUser)!;
  const cuestionarios = useCuestionarioBankStore((s) => s.cuestionarios);
  const update = useCuestionarioBankStore((s) => s.update);

  const cuestionario = useMemo(() => getById(cuestionarios, id), [cuestionarios, id]);

  if (!cuestionario) {
    return (
      <main
        style={{ background: "var(--bg-page)", minHeight: "calc(100vh - 48px)" }}
        className="flex items-center justify-center px-6"
      >
        <div
          className="ui-panel rounded-2xl p-8 max-w-md text-center"
          style={{ border: "1px solid var(--border-subtle)" }}
        >
          <h1
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
          >
            Cuestionario no encontrado
          </h1>
          <Link href="/docente" className="btn-primary inline-flex">
            Volver al panel
          </Link>
        </div>
      </main>
    );
  }

  const puedeEditar =
    currentUser.role === "admin" || currentUser.id === cuestionario.autorId;

  if (!puedeEditar) {
    return (
      <main
        style={{ background: "var(--bg-page)", minHeight: "calc(100vh - 48px)" }}
        className="flex items-center justify-center px-6"
      >
        <div
          className="ui-panel rounded-2xl p-8 max-w-md text-center"
          style={{ border: "1px solid var(--border-subtle)" }}
        >
          <h1
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
          >
            No podés editar este cuestionario
          </h1>
          <p
            className="text-sm mb-6"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            Solo el autor o un administrador pueden modificarlo.
          </p>
          <Link href="/docente" className="btn-primary inline-flex">
            Volver al panel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "calc(100vh - 48px)" }}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1
          className="text-2xl font-semibold mb-2"
          style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
        >
          Editar cuestionario
        </h1>
        <p
          className="text-sm mb-8"
          style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
        >
          Modificá los detalles y preguntas del cuestionario.
        </p>

        <CuestionarioForm
          initial={cuestionario}
          autorId={cuestionario.autorId}
          autorNombre={cuestionario.autorNombre}
          onSubmit={(input) => {
            update(id, input);
            router.push("/docente");
          }}
          onCancel={() => router.push("/docente")}
        />
      </div>
    </main>
  );
}

export default function EditarCuestionarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <RoleGate allowedRoles={["docente", "admin"]}>
      <EditarView id={id} />
    </RoleGate>
  );
}
