"use client";

import { useEffect, useMemo, useState } from "react";
import { LuMapPin, LuSearch, LuStore, LuTruck } from "react-icons/lu";
import type {
  ApiAvailableDelivery,
  ApiShipment,
  ShipmentStatus,
} from "@/lib/api/contracts.ts";
import { ApiError } from "@/lib/api/contracts.ts";
import type { ShipmentRepository } from "@/lib/shipment/shipment-repository.ts";
import { useLanguage } from "./LanguageContext";

type ShipmentRepositoryPort = Pick<
  ShipmentRepository,
  "claim" | "listAvailable" | "listShipments" | "updateStatus"
>;

type ShipmentTab = "available" | "mine";

const NEXT_NORMAL_STATUS: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  assigned: "picked_up",
  picked_up: "in_transit",
  in_transit: "delivered",
};

export default function ShipmentScreen({
  repository,
}: {
  repository: ShipmentRepositoryPort;
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ShipmentTab>("available");
  const [available, setAvailable] = useState<ApiAvailableDelivery[] | null>(null);
  const [shipments, setShipments] = useState<ApiShipment[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [claimingOrderId, setClaimingOrderId] = useState<string | null>(null);
  const [notesByShipmentId, setNotesByShipmentId] = useState<Record<string, string>>({});
  const [pendingShipmentId, setPendingShipmentId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([repository.listAvailable(), repository.listShipments()])
      .then(([availableDeliveries, ownedShipments]) => {
        if (!active) return;
        setAvailable(availableDeliveries);
        setShipments(ownedShipments);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(toErrorMessage(error));
      });

    return () => {
      active = false;
    };
  }, [repository]);

  const visibleShipments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return shipments ?? [];

    return (shipments ?? []).filter((shipment) =>
      [shipment.id, shipment.orderId, formatAddress(shipment.pickupAddress), formatAddress(shipment.deliveryAddress)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [searchQuery, shipments]);

  async function claimDelivery(orderId: string) {
    setActionError(null);
    setClaimingOrderId(orderId);

    try {
      const shipment = await repository.claim(orderId);
      setAvailable((current) => current?.filter((delivery) => delivery.orderId !== orderId) ?? []);
      setShipments((current) => replaceShipment(current ?? [], shipment));
      setActiveTab("mine");
    } catch (error) {
      setActionError(toErrorMessage(error));
      if (error instanceof ApiError && error.status === 409) {
        try {
          setAvailable(await repository.listAvailable());
        } catch (refreshError) {
          setActionError(toErrorMessage(refreshError));
        }
      }
    } finally {
      setClaimingOrderId(null);
    }
  }

  async function updateShipmentStatus(id: string, status: ShipmentStatus) {
    const note = (notesByShipmentId[id] ?? "").trim();
    if (!note) {
      setActionError(t("tship.noteRequired"));
      return;
    }
    if (note.length > 500) {
      setActionError(t("tship.noteTooLong"));
      return;
    }

    setActionError(null);
    setPendingShipmentId(id);
    try {
      const shipment = await repository.updateStatus(id, { status, note });
      setShipments((current) => replaceShipment(current ?? [], shipment));
      setNotesByShipmentId((current) => ({ ...current, [id]: "" }));
    } catch (error) {
      setActionError(toErrorMessage(error));
    } finally {
      setPendingShipmentId(null);
    }
  }

  const isLoading = available === null || shipments === null;

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div className="page-header" style={{ marginBottom: "32px" }}>
        <div className="page-header-row" style={{ alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
              <LuTruck color="var(--primary-green)" /> {t("tship.pageTitle")}
            </h1>
            <p style={{ marginTop: "4px" }}>{t("tship.pageSubtitle")}</p>
          </div>
          {activeTab === "mine" ? (
            <div className="marketplace-search" style={{ margin: 0, width: "320px" }}>
              <input
                aria-label={t("tship.searchPlaceholder")}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("tship.searchPlaceholder")}
                type="search"
                value={searchQuery}
              />
              <LuSearch className="search-icon" size={20} />
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "1px solid var(--surface-medium)", paddingBottom: "16px" }}>
        <button className={`btn ${activeTab === "available" ? "btn-primary" : "btn-outline"}`} onClick={() => setActiveTab("available")} type="button">
          {t("tship.availableTab")}
        </button>
        <button className={`btn ${activeTab === "mine" ? "btn-primary" : "btn-outline"}`} onClick={() => setActiveTab("mine")} type="button">
          {t("tship.myShipmentsTab")}
        </button>
      </div>

      {loadError ? <p role="alert">{loadError}</p> : null}
      {actionError ? <p role="alert">{actionError}</p> : null}
      {isLoading && !loadError ? <p>{t("tship.loading")}</p> : null}

      {activeTab === "available" && available ? (
        <AvailableDeliveries
          claimingOrderId={claimingOrderId}
          deliveries={available}
          onClaim={claimDelivery}
          t={t}
        />
      ) : null}
      {activeTab === "mine" && shipments ? (
        <OwnedShipments
          notesByShipmentId={notesByShipmentId}
          onNoteChange={(id, note) => setNotesByShipmentId((current) => ({ ...current, [id]: note }))}
          onUpdateStatus={updateShipmentStatus}
          pendingShipmentId={pendingShipmentId}
          shipments={visibleShipments}
          t={t}
        />
      ) : null}
    </div>
  );
}

function AvailableDeliveries({
  claimingOrderId,
  deliveries,
  onClaim,
  t,
}: {
  claimingOrderId: string | null;
  deliveries: ApiAvailableDelivery[];
  onClaim: (orderId: string) => void;
  t: (key: string) => string;
}) {
  if (deliveries.length === 0) return <EmptyState text={t("tship.noAvailable")} />;

  return (
    <section aria-label={t("tship.availableTab")} className="orders-grid">
      {deliveries.map((delivery) => (
        <article className="order-card" key={delivery.orderId}>
          <div className="order-card-header">
            <div>
              <div className="order-card-id">{t("tship.deliveryOrder")} {delivery.orderId}</div>
              <div className="order-card-date">{new Date(delivery.createdAt).toLocaleDateString()}</div>
            </div>
            <span className="order-status processing">{delivery.itemCount} {t("tship.items")}</span>
          </div>
          <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <LuStore color="var(--primary-green)" size={16} />
            {formatRedactedRoute(delivery)}
          </p>
          <p className="order-card-date">{t("tship.addressPrivate")}</p>
          <button
            className="btn btn-primary"
            disabled={claimingOrderId !== null}
            onClick={() => onClaim(delivery.orderId)}
            type="button"
          >
            {claimingOrderId === delivery.orderId ? t("tship.claiming") : t("tship.claim")}
          </button>
        </article>
      ))}
    </section>
  );
}

function OwnedShipments({
  notesByShipmentId,
  onNoteChange,
  onUpdateStatus,
  pendingShipmentId,
  shipments,
  t,
}: {
  notesByShipmentId: Record<string, string>;
  onNoteChange: (id: string, note: string) => void;
  onUpdateStatus: (id: string, status: ShipmentStatus) => void;
  pendingShipmentId: string | null;
  shipments: ApiShipment[];
  t: (key: string) => string;
}) {
  if (shipments.length === 0) return <EmptyState text={t("tship.noFoundDesc")} />;

  return (
    <section aria-label={t("tship.myShipmentsTab")} className="orders-grid">
      {shipments.map((shipment) => (
        <article className="order-card" key={shipment.id}>
          <div className="order-card-header">
            <div>
              <div className="order-card-id">{t("tship.shipmentId")} {shipment.id}</div>
              <div className="order-card-date">{t("tship.deliveryOrder")} {shipment.orderId}</div>
            </div>
            <span className="order-status processing">{statusLabel(t, shipment.status)}</span>
          </div>
          <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <LuStore color="var(--primary-green)" size={16} />
            {formatAddress(shipment.pickupAddress)}
          </p>
          <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <LuMapPin color="var(--error-red)" size={16} />
            {formatAddress(shipment.deliveryAddress)}
          </p>
          <ShipmentActions
            note={notesByShipmentId[shipment.id] ?? ""}
            onNoteChange={(note) => onNoteChange(shipment.id, note)}
            onUpdateStatus={(status) => onUpdateStatus(shipment.id, status)}
            pending={pendingShipmentId === shipment.id}
            shipment={shipment}
            t={t}
          />
          {shipment.statusHistory.length > 0 ? (
            <ol style={{ margin: "16px 0 0", paddingLeft: "20px" }}>
              {shipment.statusHistory.map((entry) => (
                <li key={`${entry.status}-${entry.timestamp}`}>
                  {statusLabel(t, entry.status)} · {new Date(entry.timestamp).toLocaleString()}
                  {entry.note ? ` — ${entry.note}` : ""}
                </li>
              ))}
            </ol>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function ShipmentActions({
  note,
  onNoteChange,
  onUpdateStatus,
  pending,
  shipment,
  t,
}: {
  note: string;
  onNoteChange: (note: string) => void;
  onUpdateStatus: (status: ShipmentStatus) => void;
  pending: boolean;
  shipment: ApiShipment;
  t: (key: string) => string;
}) {
  const nextStatus = NEXT_NORMAL_STATUS[shipment.status];
  if (!nextStatus) return null;

  const noteId = `shipment-note-${shipment.id}`;
  const disabled = pending || !note.trim() || note.trim().length > 500;

  return (
    <div style={{ display: "grid", gap: "8px", marginTop: "16px" }}>
      <label htmlFor={noteId}>{t("tship.deliveryNote")}</label>
      <textarea
        id={noteId}
        maxLength={500}
        onChange={(event) => onNoteChange(event.target.value)}
        placeholder={t("tship.deliveryNotePlaceholder")}
        value={note}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <button className="btn btn-primary" disabled={disabled} onClick={() => onUpdateStatus(nextStatus)} type="button">
          {pending ? t("tship.updating") : normalActionLabel(t, nextStatus)}
        </button>
        <button className="btn btn-outline" disabled={disabled} onClick={() => onUpdateStatus("failed")} type="button">
          {t("tship.markFailed")}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="cart-empty">{text}</p>;
}

function formatRedactedRoute(delivery: ApiAvailableDelivery): string {
  return `${delivery.pickupCity}, ${delivery.pickupProvince} → ${delivery.deliveryCity}, ${delivery.deliveryProvince}`;
}

function formatAddress(address: ApiShipment["pickupAddress"]): string {
  return [address.street, address.city, address.province, address.zip]
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

function replaceShipment(shipments: ApiShipment[], next: ApiShipment): ApiShipment[] {
  const existingIndex = shipments.findIndex((shipment) => shipment.id === next.id);
  if (existingIndex < 0) return [next, ...shipments];
  return shipments.map((shipment) => shipment.id === next.id ? next : shipment);
}

function statusLabel(t: (key: string) => string, status: ShipmentStatus): string {
  return t(`tship.status.${status}`);
}

function normalActionLabel(t: (key: string) => string, status: ShipmentStatus): string {
  return t(`tship.action.${status}`);
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
