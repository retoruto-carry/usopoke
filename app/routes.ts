import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("cards/:id", "routes/cards.$id.tsx"),
  route("draw", "routes/draw.tsx"),
  route("terms", "routes/terms.tsx"),
  route("card_test", "routes/card_test.tsx"),
  route("ogp-test", "routes/ogp-test.tsx"),
  route("card-images/:key", "routes/card-image.ts"),
  route("card-ogp.png", "routes/card-ogp.tsx"),
] satisfies RouteConfig;
