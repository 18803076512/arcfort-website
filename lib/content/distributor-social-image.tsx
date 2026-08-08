import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/content/site";

export const distributorSocialImageAlt =
  "ArcFort Weld welding and cutting products for distributors and importers";

export const distributorSocialImageSize = {
  width: 1200,
  height: 630,
};

export const distributorSocialImageContentType = "image/png";

export async function createDistributorSocialImage() {
  const background = await readFile(
    join(process.cwd(), "public", "images", "site", "arcfort-distributor-social-background.png"),
    "base64",
  );

  return new ImageResponse(
    <div
      style={{
        background: "#071524",
        color: "#ffffff",
        display: "flex",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        width: "100%",
      }}
    >
      {/* ImageResponse uses the native image element for embedded local assets. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        src={`data:image/png;base64,${background}`}
        style={{
          height: "100%",
          left: 0,
          objectFit: "cover",
          position: "absolute",
          top: 0,
          width: "100%",
        }}
      />
      <div
        style={{
          background: "rgba(7, 21, 36, 0.94)",
          bottom: 0,
          display: "flex",
          left: 0,
          position: "absolute",
          top: 0,
          width: 655,
        }}
      />
      <div
        style={{
          background: "#f0a202",
          bottom: 0,
          display: "flex",
          left: 0,
          position: "absolute",
          top: 0,
          width: 12,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "58px 44px 48px 66px",
          position: "relative",
          width: 655,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            <div
              style={{
                alignItems: "center",
                background: "#f0a202",
                color: "#071524",
                display: "flex",
                fontSize: 20,
                fontWeight: 900,
                height: 46,
                justifyContent: "center",
                marginRight: 16,
                width: 46,
              }}
            >
              AF
            </div>
            ARCFORT WELD
          </div>
          <div
            style={{
              color: "#f0a202",
              display: "flex",
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: 2,
              marginTop: 52,
              textTransform: "uppercase",
            }}
          >
            Distributor Product Supply
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 900,
              letterSpacing: 0,
              lineHeight: 1.04,
              marginTop: 18,
            }}
          >
            Welding Products for Distributors & Importers
          </div>
          <div
            style={{
              color: "#d7e1ea",
              display: "flex",
              fontSize: 21,
              lineHeight: 1.4,
              marginTop: 25,
            }}
          >
            MIG/MAG torch parts, TIG torch parts, plasma cutting consumables and OEM supply.
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.22)",
            color: "#c5d2de",
            display: "flex",
            flexDirection: "column",
            fontSize: 16,
            lineHeight: 1.45,
            paddingTop: 18,
          }}
        >
          <div style={{ display: "flex", fontWeight: 700 }}>{siteConfig.legalName}</div>
          <div style={{ display: "flex" }}>www.arcfortweld.com</div>
        </div>
      </div>
    </div>,
    distributorSocialImageSize,
  );
}
