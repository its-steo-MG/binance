// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PnlValue } from "./assets-controls";

afterEach(cleanup);

describe("PnlValue (used by Home and Assets Today's PNL)", () => {
  it("shows a positive Today's PNL in green with a plus sign", () => {
    render(<PnlValue pnl={{ amount: "12.5", percentage: 3.4 }} />);
    const el = screen.getByTestId("pnl-value");
    expect(el.className).toContain("text-up");
    expect(el.textContent).toContain("+12.5 USDT");
    expect(el.textContent).toContain("(+3.40%)");
  });

  it("shows a negative Today's PNL in red", () => {
    render(<PnlValue pnl={{ amount: "-0.00006967" }} />);
    const el = screen.getByTestId("pnl-value");
    expect(el.className).toContain("text-down");
    expect(el.textContent).not.toContain("+");
  });

  it("does not show zero for missing backend data", () => {
    render(<PnlValue pnl={undefined} />);
    const el = screen.getByTestId("pnl-value");
    expect(el.className).toContain("text-muted");
    expect(el.textContent).not.toContain("0.00");
  });

  it("converts USDT PNL to KES for display", () => {
    render(<PnlValue pnl={{ amount: 2 }} unit="KES" kes={130} />);
    expect(screen.getByTestId("pnl-value").textContent).toContain("+KSh260.00");
  });
});
