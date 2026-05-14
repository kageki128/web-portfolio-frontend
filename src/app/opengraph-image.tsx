import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_SHARE_IMAGE_ALT } from "@/constants/siteMetadata";

export const alt = SITE_SHARE_IMAGE_ALT;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          color: "#f8fafc",
          background: "linear-gradient(135deg, #111827 0%, #1d4ed8 55%, #0891b2 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            borderRadius: "999px",
            padding: "10px 22px",
            fontSize: 28,
            fontWeight: 700,
            border: "1px solid rgba(248,250,252,0.4)",
            backgroundColor: "rgba(15,23,42,0.35)",
          }}
        >
          Portfolio
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 86, fontWeight: 800, lineHeight: 1.1 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 38, fontWeight: 500, lineHeight: 1.3, opacity: 0.95 }}>
            {SITE_DESCRIPTION}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
