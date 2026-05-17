"use client";
import { ReactNode } from "react";
import { AnatomyItem } from "../../store/anatomyStore";
import { JsonIndex } from "../../utils/indexBuilder";
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
  json: Record<string, AnatomyItem>;
  scannerIndex: JsonIndex;
  children: ReactNode;
};

export function ModelPageLayout({ breadcrumbItems, json, scannerIndex, children }: Props) {
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
      <div className="flex flex-col lg:flex-row w-full" style={{ height: "calc(100vh - 48px - 33px)" }}>

        {/* Canvas Zone */}
        <div
          id="canvas-container"
          className="relative w-full h-[50vh] lg:w-[65%] lg:h-full"
          style={{ background: "var(--bg-canvas)" }}
        >
          <SceneCanvas json={json} scannerIndex={scannerIndex} background="var(--bg-canvas)">
            {children}
          </SceneCanvas>

          {/* Floating toolbar */}
          <ViewerToolbar />
        </div>

        {/* Right Panel */}
        <div
          className="w-full lg:w-[35%] h-[50vh] lg:h-full overflow-hidden flex flex-col"
          style={{ borderLeft: "1px solid var(--border-subtle)" }}
        >
          <ViewerRightPanel />
        </div>
      </div>
    </div>
  );
}
