import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

// Image metadata for Next.js to generate <link> tags and output file config
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

// Programmatic icon generation that resizes the high-res favicon.png down to 512x512
export default function Icon() {
  const imagePath = path.join(process.cwd(), "public/favicon.png");
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const dataUrl = `data:image/png;base64,${base64Image}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt="StalkJobs Favicon"
          width="512"
          height="512"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
