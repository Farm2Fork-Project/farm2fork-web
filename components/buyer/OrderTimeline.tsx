"use client";

import {
  IcAlert,
  IcCard,
  IcCheck,
  IcClose,
  IcPackage,
  IcReceipt,
  IcTruck,
} from "@/components/icons";
import type { ApiShipment } from "@/lib/api/contracts.ts";
import { type OrderStage, type StageId } from "@/lib/buyer/order-progress.ts";
import { useBuyerCopy } from "@/lib/buyer/use-buyer-copy";
import { useLanguage } from "../LanguageContext";

const STAGE_ICON: Record<StageId, typeof IcCheck> = {
  placed: IcReceipt,
  paid: IcCard,
  picked_up: IcPackage,
  in_transit: IcTruck,
  delivered: IcCheck,
  cancelled: IcClose,
};

const STAGE_LABEL: Record<StageId, string> = {
  placed: "Order placed",
  paid: "Payment confirmed",
  picked_up: "Picked up from the farm",
  in_transit: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/**
 * The steps of one order, drawn from what the server recorded: a time under a
 * step means it happened, a ringed step is the one it is waiting on.
 */
export function OrderTimeline({
  stages,
  shipment,
}: {
  stages: OrderStage[];
  shipment?: ApiShipment;
}) {
  const copy = useBuyerCopy();
  const { language } = useLanguage();
  const format = new Intl.DateTimeFormat(
    language === "ur" ? "ur-PK" : "en-GB",
    {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
  );
  const when = (iso?: string) => {
    if (!iso) return "";
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "" : format.format(date);
  };

  return (
    <ol className="ot" aria-label={copy("Order progress")}>
      {stages.map((stage) => {
        const Icon = stage.state === "problem" ? IcAlert : STAGE_ICON[stage.id];
        const label =
          stage.state === "problem" && stage.id === "paid"
            ? "Payment did not go through"
            : stage.state === "problem" && stage.id === "delivered"
              ? "Delivery problem"
              : STAGE_LABEL[stage.id];
        const expected =
          stage.id === "delivered" &&
          stage.state !== "done" &&
          stage.state !== "problem" &&
          shipment?.estimatedDelivery
            ? copy("Expected {date}", {
                date: when(shipment.estimatedDelivery),
              })
            : "";
        const time =
          stage.state === "done" || stage.state === "problem"
            ? when(stage.at)
            : expected;
        return (
          <li
            key={stage.id}
            className="ot-step"
            data-state={stage.state}
            aria-current={stage.state === "current" ? "step" : undefined}
          >
            <span className="ot-dot" aria-hidden="true">
              <Icon size={16} />
            </span>
            <span className="ot-label">{copy(label)}</span>
            {time ? <span className="ot-time">{time}</span> : null}
            <span className="sr-only">
              {stage.state === "done"
                ? copy("Done")
                : stage.state === "current"
                  ? copy("Waiting on this step")
                  : stage.state === "problem"
                    ? copy("Needs attention")
                    : copy("Not reached yet")}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
