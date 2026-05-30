"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type Status = "idle" | "subscribed" | "working" | "unsupported" | "denied";

export default function PushToggle() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !VAPID_PUBLIC
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unsupported");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "subscribed" : "idle"))
      .catch(() => {});
  }, []);

  async function enable() {
    setError(null);
    setStatus("working");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus("denied");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC!),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error("Enregistrement refusé par le serveur");
      setStatus("subscribed");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("idle");
    }
  }

  async function disable() {
    setStatus("working");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("idle");
    } catch {
      setStatus("subscribed");
    }
  }

  if (status === "unsupported") {
    return (
      <p className="text-xs text-emerald-700/60">
        🔔 Notifications indisponibles sur cet appareil (ou non configurées sur le
        serveur).
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "subscribed" ? (
        <>
          <span className="text-sm text-emerald-800">
            🔔 Notifications activées sur cet appareil
          </span>
          <button
            onClick={disable}
            className="rounded-full px-3 py-1 text-xs text-rose-600 hover:bg-rose-50"
          >
            Désactiver
          </button>
        </>
      ) : (
        <button
          onClick={enable}
          disabled={status === "working"}
          className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {status === "working" ? "…" : "🔔 Activer les rappels sur cet appareil"}
        </button>
      )}
      {status === "denied" && (
        <span className="text-xs text-rose-600">
          Autorisation refusée dans le navigateur.
        </span>
      )}
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
