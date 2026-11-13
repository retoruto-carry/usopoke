import { Buffer } from "node:buffer";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import { CARD_HEIGHT, CARD_RADIUS, CARD_WIDTH, OGP_HEIGHT, OGP_WIDTH } from "./CardOgp";

let rendererReady: Promise<void> | undefined;

export async function renderCardOgp(image: ArrayBuffer): Promise<Uint8Array<ArrayBuffer>> {
  rendererReady ??= initWasm(resvgWasm);
  await rendererReady;

  const x = (OGP_WIDTH - CARD_WIDTH) / 2;
  const y = (OGP_HEIGHT - CARD_HEIGHT) / 2;
  const source = Buffer.from(image).toString("base64");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OGP_WIDTH}" height="${OGP_HEIGHT}">
    <defs>
      <clipPath id="card">
        <rect x="${x}" y="${y}" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="${CARD_RADIUS}"/>
      </clipPath>
      <filter id="shadow">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="#f0f0f0"/>
    <rect x="${x}" y="${y}" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="${CARD_RADIUS}" filter="url(#shadow)"/>
    <image x="${x}" y="${y}" width="${CARD_WIDTH}" height="${CARD_HEIGHT}"
      href="data:image/png;base64,${source}" clip-path="url(#card)" preserveAspectRatio="none"/>
  </svg>`;

  const renderer = new Resvg(svg, { font: { loadSystemFonts: false } });
  try {
    const png = renderer.render();
    try {
      return new Uint8Array(png.asPng());
    } finally {
      png.free();
    }
  } finally {
    renderer.free();
  }
}
