import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "VisionPipe3D - Hand Tracking 3D Control";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: "bold",
              color: "white",
              margin: 0,
              marginBottom: 16,
            }}
          >
            VisionPipe3D
          </h1>
          <p
            style={{
              fontSize: 32,
              color: "#888",
              margin: 0,
              marginBottom: 40,
            }}
          >
            Hand Tracking 3D Control
          </p>
          <div
            style={{
              width: 400,
              height: 4,
              borderRadius: 2,
              background: "linear-gradient(90deg, #ff0066 0%, #00ffff 100%)",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
