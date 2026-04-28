import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("renders the Fetchlinks scaffold message", () => {
    const markup = renderToStaticMarkup(Home());

    expect(markup).toContain("Fetchlinks Web");
    expect(markup).toContain("Next.js scaffold is ready.");
  });
});