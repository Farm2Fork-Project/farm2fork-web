"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ApiAvailableDelivery,
  ApiShipment,
  ShipmentStatus,
} from "@/lib/api/contracts.ts";
import { ApiError } from "@/lib/api/contracts.ts";
import type { ShipmentRepository } from "@/lib/shipment/shipment-repository.ts";
import type { DeliveryRepository } from '@/lib/delivery/delivery-repository';
import { DriverHandover } from "@/components/delivery/DriverHandover";
import { TransporterAvailability } from "./TransporterAvailability";
import { orderStatusClass } from "@/lib/status.ts";
import { useLanguage } from "./LanguageContext";
import { IcMapPin, IcSearch, IcStore, IcTruck } from "@/components/icons";

type ShipmentRepositoryPort = Pick<
  ShipmentRepository,
  | "claim"
  | "listAvailable"
  | "listShipments"
  | "updateStatus"
  | "getTransporterStatus"
  | "setAvailability"
  | "updateLocation"
  | "decline"
>;

type ShipmentTab = "available" | "mine";

const NEXT_NORMAL_STATUS: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  assigned: "picked_up",
  picked_up: "in_transit",

};

export default function ShipmentScreen({
  repository, handoverRepository,
}: {
  repository: ShipmentRepositoryPort;
  handoverRepository?: DeliveryRepository;
}) {
  const { t } = useLanguage();
  const [statusRevision, setStatusRevision] = useState(0);
  const [activeTab, setActiveTab] = useState<ShipmentTab>("available");
  const [available, setAvailable] = useState<ApiAvailableDelivery[] | null>(
    null,
  );
  const [shipments, setShipments] = useState<ApiShipment[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [claimingOrderId, setClaimingOrderId] = useState<string | null>(null);
  const [notesByShipmentId, setNotesByShipmentId] = useState<
    Record<string, string>
  >({});
  const [pendingShipmentId, setPendingShipmentId] = useState<string | null>(
    null,
  );

  const listEpoch = useRef(0);
  const actionLock = useRef(false);
  useEffect(() => {
    let active = true;

    let loading = false;
    const load = () => {
    if (loading || document.visibilityState === "hidden") return;
    if (actionLock.current) return;
    loading = true; const epoch = listEpoch.current;
    Promise.all([repository.listAvailable(), repository.listShipments()])
      .then(([availableDeliveries, ownedShipments]) => {
        if (!active || epoch !== listEpoch.current) return;
        setAvailable(availableDeliveries);
        setShipments(ownedShipments);
        if (ownedShipments.some(s => ["assigned", "picked_up", "in_transit"].includes(s.status))) setActiveTab("mine");
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(toErrorMessage(error));
      }).finally(() => { loading = false; });
    };
    load();
    const timer = setInterval(load, 30000);
    document.addEventListener("visibilitychange", load);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
      active = false;
    };
  }, [repository]);

  const visibleShipments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return shipments ?? [];

    return (shipments ?? []).filter((shipment) =>
      [
        shipment.id,
        shipment.orderId,
        formatAddress(shipment.pickupAddress),
        formatAddress(shipment.deliveryAddress),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [searchQuery, shipments]);

  const refresh = useCallback(async () => {
    const [offers, mine] = await Promise.all([
      repository.listAvailable(),
      repository.listShipments(),
    ]);
    setAvailable(offers);
    setShipments(mine);
    setLoadError(null);
  }, [repository]);
  async function declineDelivery(orderId: string) {
    if (actionLock.current) return;
    actionLock.current = true;
    listEpoch.current++;
    setClaimingOrderId(orderId);
    setActionError(null);
    try {
      await repository.decline(orderId);
      setAvailable(current => current?.filter(offer => offer.orderId !== orderId) ?? []);
      try { await refresh(); } catch { setLoadError("Decline saved. Refresh offers to update the list."); }
    } catch (error) {
      setActionError(toErrorMessage(error));
    } finally {
      actionLock.current = false;
      setClaimingOrderId(null);
    }
  }

  async function claimDelivery(orderId: string) {
    if (actionLock.current) return;
    actionLock.current = true;
    listEpoch.current++;
    setActionError(null);
    setClaimingOrderId(orderId);

    try {
      const shipment = await repository.claim(orderId);
      setAvailable([]);
      setShipments((current) => replaceShipment(current ?? [], shipment));
      setActiveTab("mine");
      setStatusRevision((v) => v + 1);
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
      actionLock.current = false;
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

    if (actionLock.current) return;
    actionLock.current = true;
    listEpoch.current++;
    setActionError(null);
    setPendingShipmentId(id);
    try {
      const shipment = await repository.updateStatus(id, { status, note });
      setShipments((current) => replaceShipment(current ?? [], shipment));
      setNotesByShipmentId((current) => ({ ...current, [id]: "" }));
      try { setAvailable(await repository.listAvailable()); } catch { setLoadError("Delivery step saved. Refresh to update offers."); }
      setStatusRevision((v) => v + 1);
    } catch (error) {
      setActionError(toErrorMessage(error));
      if (error instanceof ApiError && error.status === 0) {
        try { setShipments(await repository.listShipments()); setActionError("Request result was uncertain. Current delivery refreshed; review its step before retrying."); }
        catch { setLoadError("Could not check the delivery. Refresh before retrying this step."); }
      }
    } finally {
      actionLock.current = false;
      setPendingShipmentId(null);
    }
  }

  const isLoading = available === null || shipments === null;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "32px" }}>
        <div className="page-header-row">
          <div>
            <h1 className="page-title page-title-with-icon">
              <IcTruck color="var(--primary-green)" /> {t("tship.pageTitle")}
            </h1>
            <p>{t("tship.pageSubtitle")}</p>
          </div>
          {activeTab === "mine" ? (
            <div
              className="marketplace-search"
              style={{ margin: 0, width: "min(320px, 100%)" }}
            >
              <input
                aria-label={t("tship.searchPlaceholder")}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("tship.searchPlaceholder")}
                type="search"
                value={searchQuery}
              />
              <IcSearch className="search-icon" size={20} />
            </div>
          ) : null}
        </div>
      </div>

      <TransporterAvailability
        repository={repository}
        revision={statusRevision}
        onRefresh={refresh}
      />

      <div className="shipment-tabs">
        <button
          className={`btn ${activeTab === "available" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setActiveTab("available")}
          type="button"
        >
          {t("tship.availableTab")}
        </button>
        <button
          className={`btn ${activeTab === "mine" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setActiveTab("mine")}
          type="button"
        >
          {t("tship.myShipmentsTab")}
        </button>
      </div>

      {loadError ? <div role="alert">{loadError}<button className="btn btn-outline" onClick={() => void refresh().catch(e => setLoadError(toErrorMessage(e)))}>Retry refresh</button></div> : null}
      {actionError ? <p role="alert">{actionError}</p> : null}
      {isLoading && !loadError ? <p>{t("tship.loading")}</p> : null}

      {activeTab === "available" && available ? (
        <AvailableDeliveries
          claimingOrderId={claimingOrderId}
          deliveries={available}
          onClaim={claimDelivery}
          onDecline={declineDelivery}
          t={t}
        />
      ) : null}
      {activeTab === "mine" && shipments ? (
        <OwnedShipments
          handoverRepository={handoverRepository}
          requestLock={actionLock}
          onBusy={(id, busy) => { listEpoch.current++; setPendingShipmentId(busy ? id : null); }}
          onUpdated={shipment => { setShipments(current => replaceShipment(current ?? [], shipment)); setStatusRevision(v => v + 1); if (shipment.status === "delivered" || shipment.status === "failed") void refresh().catch(() => setLoadError("Delivery saved. Refresh to update available offers.")); }}
          notesByShipmentId={notesByShipmentId}
          onNoteChange={(id, note) =>
            setNotesByShipmentId((current) => ({ ...current, [id]: note }))
          }
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
  onDecline,
  t,
}: {
  claimingOrderId: string | null;
  deliveries: ApiAvailableDelivery[];
  onClaim: (orderId: string) => void;
  onDecline: (orderId: string) => void;
  t: (key: string) => string;
}) {
  if (deliveries.length === 0)
    return <EmptyState text={t("tship.noAvailable")} />;

  return (
    <section aria-label={t("tship.availableTab")} className="orders-grid">
      {deliveries.map((delivery) => (
        <article className="order-card" key={delivery.orderId}>
          <div className="order-card-header">
            <div>
              <div className="order-card-id">
                {t("tship.deliveryOrder")} {delivery.orderId}
              </div>
              <div className="order-card-date">
                {new Date(delivery.createdAt).toLocaleDateString()}
              </div>
            </div>
            <span className="order-status processing">
              {delivery.itemCount} {t("tship.items")}
            </span>
          </div>
          <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IcStore color="var(--primary-green)" size={16} />
            {formatRedactedRoute(delivery)}
          </p>
          <p className="order-card-date">{t("tship.addressPrivate")}</p>
          <OfferCargo delivery={delivery} />
          {delivery.deliveryFee !== undefined ? (
            <p>
              {t("dispatch.earning")}: Rs{" "}
              {delivery.deliveryFee.toLocaleString("en-PK")}
            </p>
          ) : null}
          {delivery.distanceToPickupKm !== undefined ? (
            <p>
              {t("dispatch.pickupDistance")}: {delivery.distanceToPickupKm} km
            </p>
          ) : null}
          {delivery.deliveryDistanceKm !== undefined ? (
            <p>
              {t("dispatch.deliveryDistance")}: {delivery.deliveryDistanceKm} km
            </p>
          ) : null}
          <button
            className="btn btn-outline"
            type="button"
            disabled={claimingOrderId !== null}
            onClick={() => onDecline(delivery.orderId)}
          >
            {t("dispatch.decline")}
          </button>
          <button
            className="btn btn-primary"
            disabled={claimingOrderId !== null}
            onClick={() => onClaim(delivery.orderId)}
            type="button"
          >
            {claimingOrderId === delivery.orderId
              ? t("tship.claiming")
              : t("tship.claim")}
          </button>
        </article>
      ))}
    </section>
  );
}

function OwnedShipments({
  handoverRepository,
  requestLock, onBusy,
  onUpdated,
  notesByShipmentId,
  onNoteChange,
  onUpdateStatus,
  pendingShipmentId,
  shipments,
  t,
}: {
  handoverRepository?: DeliveryRepository;
  requestLock: { current: boolean };
  onBusy: (id: string, busy: boolean) => void;
  onUpdated: (shipment: ApiShipment) => void;
  notesByShipmentId: Record<string, string>;
  onNoteChange: (id: string, note: string) => void;
  onUpdateStatus: (id: string, status: ShipmentStatus) => void;
  pendingShipmentId: string | null;
  shipments: ApiShipment[];
  t: (key: string) => string;
}) {
  const { language } = useLanguage(); const ur = language === "ur";
  if (shipments.length === 0)
    return <EmptyState text={t("tship.noFoundDesc")} />;

  return (
    <section aria-label={t("tship.myShipmentsTab")} className="orders-grid">
      {[...shipments].sort((a,b) => Number(["assigned","picked_up","in_transit"].includes(b.status)) - Number(["assigned","picked_up","in_transit"].includes(a.status))).map((shipment) => (
        <article className="order-card" key={shipment.id}>
          <div className="order-card-header">
            <div>
              <div className="order-card-id">
                {t("tship.shipmentId")} {shipment.id}
              </div>
              <div className="order-card-date">
                {t("tship.deliveryOrder")} {shipment.orderId}
              </div>
            </div>
            <span
              className={`order-status ${orderStatusClass(shipment.status)}`}
            >
              {statusLabel(t, shipment.status)}
            </span>
          </div>
          <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IcStore color="var(--primary-green)" size={16} />
            {formatAddress(shipment.pickupAddress)}
          </p>
          <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IcMapPin color="var(--error-red)" size={16} />
            {formatAddress(shipment.deliveryAddress)}
          </p>
          {shipment.deliveryFee !== undefined ? (
            <p>
              {t("dispatch.earning")}: Rs{" "}
              {shipment.deliveryFee.toLocaleString("en-PK")}
            </p>
          ) : null}
          {["assigned", "picked_up", "in_transit"].includes(shipment.status) && <p><strong>{ur ? "موجودہ ڈیلیوری" : "Active delivery"}</strong> · <a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formatAddress(shipment.status === "assigned" ? shipment.pickupAddress : shipment.deliveryAddress))}`}>{ur ? "راستہ کھولیں" : "Open directions"}</a><span> · {ur ? "نقشہ دستیاب نہ ہو تو اوپر دیا گیا پتہ استعمال کریں۔" : "If maps is unavailable, use the address above."}</span></p>}
          <ShipmentContacts shipment={shipment} />
          <DriverHandover repository={handoverRepository} shipment={shipment} onUpdated={onUpdated} requestLock={requestLock} onBusy={busy => onBusy(shipment.id, busy)} />
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
                  {statusLabel(t, entry.status)} ·{" "}
                  {new Date(entry.timestamp).toLocaleString()}
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
        disabled={pending}
        maxLength={500}
        onChange={(event) => onNoteChange(event.target.value)}
        placeholder={t("tship.deliveryNotePlaceholder")}
        value={note}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <button
          className="btn btn-primary"
          disabled={disabled}
          onClick={() => onUpdateStatus(nextStatus)}
          type="button"
        >
          {pending ? t("tship.updating") : normalActionLabel(t, nextStatus)}
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

function replaceShipment(
  shipments: ApiShipment[],
  next: ApiShipment,
): ApiShipment[] {
  const existingIndex = shipments.findIndex(
    (shipment) => shipment.id === next.id,
  );
  if (existingIndex < 0) return [next, ...shipments];
  return shipments.map((shipment) =>
    shipment.id === next.id ? next : shipment,
  );
}

function statusLabel(
  t: (key: string) => string,
  status: ShipmentStatus,
): string {
  return t(`tship.status.${status}`);
}

function normalActionLabel(
  t: (key: string) => string,
  status: ShipmentStatus,
): string {
  return t(`tship.action.${status}`);
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function ShipmentContacts({ shipment }: { shipment: ApiShipment }) {
 const { language } = useLanguage(); const ur = language === 'ur';
 const scoped = shipment as ApiShipment & { pickupContact?: {name?:string;phone?:string}; deliveryContact?:{name?:string;phone?:string} };
 if (!['assigned','picked_up','in_transit'].includes(shipment.status)) return null;
 return <>{([['pickup',scoped.pickupContact],['delivery',scoped.deliveryContact]] as const).map(([kind,contact]) => contact && (contact.name || contact.phone) ? <p key={kind}>{kind === 'pickup' ? (ur ? 'پک اپ رابطہ' : 'Pickup contact') : (ur ? 'وصول کنندہ' : 'Delivery contact')}: {contact.name} {contact.phone && <a href={`tel:${contact.phone.replace(/[^+0-9]/g,'')}`}>{contact.phone}</a>}</p> : null)}</>;
}

function OfferCargo({delivery}: {delivery: ApiAvailableDelivery}) {
 const items = (delivery as ApiAvailableDelivery & {items?: {productName?:string; name?:string; quantity?:number; unit?:string}[]}).items;
 if (!items?.length) return null;
 return <ul>{items.map((item,index) => <li key={index}>{item.productName}{item.quantity !== undefined ? ` · ${item.quantity}` : ''}{item.unit ? ` ${item.unit}` : ''}</li>)}</ul>;
}
