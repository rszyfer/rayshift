import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// The "framer" module is provided natively by the Framer runtime when this
// component is pasted in as a Code Component — it is never an npm dependency
// there. For local development with Vite we alias it to a tiny local stub
// (src/framer-stub.ts) that implements just enough of the surface
// (ControlType + addPropertyControls) so the exact same source file works
// in both places without modification.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      framer: path.resolve(__dirname, "src/framer-stub.ts"),
    },
  },
});
