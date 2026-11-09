import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Leaflet needs a real layout engine; component tests use light stand-ins and
// drive the "user moved the map" path through globalThis.__mapUserMove.
vi.mock("@/components/maps/PinMapCanvas", async () => {
  const React = await import("react");
  return {
    default: function PinMapCanvasStub(props: {
      center: { lat: number; lng: number };
      fly: { point: { lat: number; lng: number }; zoom: number } | null;
      onUserMove: (point: { lat: number; lng: number }) => void;
      label: string;
    }) {
      (globalThis as Record<string, unknown>).__mapUserMove = props.onUserMove;
      return React.createElement("div", {
        "data-testid": "pin-map",
        "aria-label": props.label,
        "data-fly": props.fly ? `${props.fly.point.lat},${props.fly.point.lng},${props.fly.zoom}` : "",
      });
    },
  };
});
vi.mock("@/components/maps/DeliveryMapCanvas", async () => {
  const React = await import("react");
  return {
    default: function DeliveryMapCanvasStub(props: {
      points: { id: string; kind: string; label: string }[];
    }) {
      return React.createElement(
        "div",
        { "data-testid": "delivery-map" },
        props.points.map((p) => React.createElement("i", { key: p.id, "data-kind": p.kind, "data-label": p.label })),
      );
    },
  };
});
