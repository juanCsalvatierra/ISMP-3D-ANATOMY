"use client";
import { ReactNode } from "react";
import { SceneCanvas } from "../scene/SceneCanvas";
import { Breadcrumb } from "./Breadcrumb";
import { ViewerRightPanel } from "./ViewerRightPanel";
import { ViewerToolbar } from "./ViewerToolbar";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  breadcrumbItems: BreadcrumbItem[];
  children: ReactNode;
};

export function ModelPageLayout({ breadcrumbItems, children }: Props) {
  return (
    <div className="w-full flex flex-col" style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}>
      {/* Breadcrumb bar */}
      <div
        className="shrink-0 w-full"
        style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-page)" }}
      >
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main 2-column layout */}
      {/* Alto = pantalla - barra global (48px) - breadcrumb (33px). dvh descuenta la
          barra del navegador en celulares; 100vh queda de respaldo. */}
      <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-81px)] supports-[height:100dvh]:h-[calc(100dvh-81px)]">

        {/* Canvas Zone */}
        <div
          id="canvas-container"
          className="relative w-full h-[42%] shrink-0 lg:w-[65%] lg:h-full"
          style={{ background: "var(--bg-canvas)" }}
        >
          <SceneCanvas background="var(--bg-canvas)">
            {children}
          </SceneCanvas>

          {/* Floating toolbar */}
          <ViewerToolbar />
        </div>

        {/* Right Panel */}
        <div
          className="w-full lg:w-[35%] flex-1 min-h-0 lg:h-full overflow-hidden flex flex-col"
          style={{ borderLeft: "1px solid var(--border-subtle)" }}
        >
          <ViewerRightPanel />
        </div>
      </div>
    </div>
  );
}
