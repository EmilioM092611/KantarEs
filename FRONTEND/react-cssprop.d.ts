// FRONTEND/react-cssprop.d.ts
import "react";

declare module "react" {
  interface CSSProperties {
    "--animation-delay"?: string;
    "--animation-duration"?: string;
  }
}
