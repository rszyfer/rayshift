/**
 * Local stand-in for the "framer" module, which is only available inside the
 * actual Framer canvas/runtime. Aliased in vite.config.ts so the component
 * source can `import { addPropertyControls, ControlType } from "framer"`
 * unmodified and still run under `npm run dev`. Framer itself ignores this
 * file entirely and resolves the real "framer" package on its own.
 */

export enum ControlType {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Color = "color",
  Enum = "enum",
  Object = "object",
  Array = "array",
}

export function addPropertyControls(_component: unknown, _controls: unknown): void {
  // no-op outside Framer
}

export const RenderTarget = {
  current: () => "preview",
  canvas: "canvas",
  export: "export",
  preview: "preview",
  thumbnail: "thumbnail",
};
