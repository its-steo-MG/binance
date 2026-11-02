// @vitest-environment jsdom
import React, { StrictMode, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SlideConfirm } from "./flow";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("React", React);
  vi.stubGlobal("PointerEvent", class extends MouseEvent {
    pointerId: number;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
    }
  });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

function setup(seconds = 15) {
  const onConfirm = vi.fn();
  const onExpired = vi.fn();
  function Parent() {
    const [expired, setExpired] = useState(false);
    return expired
      ? <button onClick={() => setExpired(false)}>Refresh</button>
      : <SlideConfirm seconds={seconds} label="Slide to confirm" expired={false}
          onConfirm={onConfirm} onExpired={() => { onExpired(); setExpired(true); }} />;
  }
  render(<StrictMode><Parent /></StrictMode>);
  const button = screen.getByRole("button", { name: "Slide to confirm" });
  const track = button.parentElement;
  if (!track) throw new Error("Missing track");
  Object.defineProperty(track, "clientWidth", { configurable: true, value: 300 });
  const capture = vi.fn();
  button.setPointerCapture = capture;
  button.hasPointerCapture = () => true;
  button.releasePointerCapture = vi.fn();
  return { button, track, capture, onConfirm, onExpired };
}

describe("SlideConfirm", () => {
  it("expires the 15-second quote once without updating its parent during render", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const { onExpired, onConfirm } = setup();
      act(() => vi.advanceTimersByTime(15000));
      expect(onExpired).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
      expect(error.mock.calls.flat().join(" ")).not.toContain("Cannot update a component");
      fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
      expect(screen.getByRole("button", { name: "Slide to confirm" })).toBeTruthy();
      act(() => vi.advanceTimersByTime(15000));
      expect(onExpired).toHaveBeenCalledTimes(2);
    } finally { error.mockRestore(); }
  });

  it("captures on the handle even when dragging starts on its arrow", () => {
    const { button, capture } = setup();
    const arrow = button.querySelector("path");
    if (!arrow) throw new Error("Missing arrow");
    fireEvent.pointerDown(arrow, { clientX: 24, pointerId: 7, button: 0 });
    expect(capture).toHaveBeenCalledWith(7);
  });

  it("confirms a full drag once and rejects a short drag", () => {
    const { button, onConfirm } = setup();
    fireEvent.pointerDown(button, { clientX: 24, pointerId: 7, button: 0 });
    fireEvent.pointerMove(button, { clientX: 100, pointerId: 7 });
    fireEvent.pointerUp(button, { clientX: 100, pointerId: 7 });
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.pointerDown(button, { clientX: 24, pointerId: 7, button: 0 });
    fireEvent.pointerUp(button, { clientX: 290, pointerId: 7 });
    fireEvent.keyDown(button, { key: "Enter" });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("cancels interrupted gestures without submitting", () => {
    const { button, onConfirm } = setup();
    fireEvent.pointerDown(button, { clientX: 24, pointerId: 7, button: 0 });
    fireEvent.pointerMove(button, { clientX: 290, pointerId: 7 });
    fireEvent.pointerCancel(button, { pointerId: 7 });
    fireEvent.pointerUp(button, { clientX: 290, pointerId: 7 });
    expect(onConfirm).not.toHaveBeenCalled();
  });
});