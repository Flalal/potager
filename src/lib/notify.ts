import "server-only";

import webpush from "web-push";
import { listPushSubs, removePushSub } from "./push-store";
import { listPlantations } from "./garden-store";
import { getPlantById } from "./plants";
import {
  getCurrentMonth,
  monthlyTasks,
  plantsByActionForMonthAdjusted,
} from "./calendar";
import { MONTHS_FR } from "./types";

export interface NotifMessage {
  title: string;
  body: string;
}

export interface ChannelResult {
  channel: string;
  ok: boolean;
  detail?: string;
}

let vapidReady = false;
function ensureVapid(): boolean {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:potager@example.com";
  if (!pub || !priv) return false;
  if (!vapidReady) {
    webpush.setVapidDetails(subject, pub, priv);
    vapidReady = true;
  }
  return true;
}

async function sendDiscord(msg: NotifMessage): Promise<ChannelResult | null> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: `**${msg.title}**\n${msg.body}` }),
    });
    return { channel: "discord", ok: res.ok, detail: `HTTP ${res.status}` };
  } catch (e) {
    return { channel: "discord", ok: false, detail: String(e) };
  }
}

async function sendHomeAssistant(
  msg: NotifMessage
): Promise<ChannelResult | null> {
  // Mode 1 : webhook HA (le plus simple)
  const webhook = process.env.HA_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: msg.title, message: msg.body }),
      });
      return { channel: "home-assistant", ok: res.ok, detail: `HTTP ${res.status}` };
    } catch (e) {
      return { channel: "home-assistant", ok: false, detail: String(e) };
    }
  }

  // Mode 2 : API REST + service notify + long-lived token
  const base = process.env.HA_BASE_URL;
  const token = process.env.HA_TOKEN;
  const service = process.env.HA_NOTIFY_SERVICE; // ex: "mobile_app_pixel"
  if (base && token && service) {
    try {
      const res = await fetch(
        `${base.replace(/\/$/, "")}/api/services/notify/${service}`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ title: msg.title, message: msg.body }),
        }
      );
      return { channel: "home-assistant", ok: res.ok, detail: `HTTP ${res.status}` };
    } catch (e) {
      return { channel: "home-assistant", ok: false, detail: String(e) };
    }
  }
  return null;
}

async function sendWebPush(msg: NotifMessage): Promise<ChannelResult | null> {
  if (!ensureVapid()) return null;
  const subs = listPushSubs();
  if (subs.length === 0) {
    return { channel: "web-push", ok: true, detail: "0 abonné" };
  }
  const payload = JSON.stringify({ title: msg.title, body: msg.body });
  let sent = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (e: unknown) {
        failed++;
        const status = (e as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          removePushSub(sub.endpoint); // abonnement expiré
        }
      }
    })
  );
  return {
    channel: "web-push",
    ok: failed === 0,
    detail: `${sent} envoyés, ${failed} échecs`,
  };
}

/** Envoie un message sur tous les canaux configurés. */
export async function sendNotification(
  msg: NotifMessage
): Promise<ChannelResult[]> {
  const results = await Promise.all([
    sendDiscord(msg),
    sendHomeAssistant(msg),
    sendWebPush(msg),
  ]);
  return results.filter((r): r is ChannelResult => r !== null);
}

/** Construit le résumé des tâches du mois à partir des plantations en base. */
export function buildMonthlyDigest(): NotifMessage {
  const offset = Number(process.env.NOTIFY_ZONE_OFFSET ?? 0) || 0;
  const month = getCurrentMonth();
  const moisNom = MONTHS_FR[month - 1];

  const plantations = listPlantations();
  const lignes: string[] = [];

  for (const pl of plantations) {
    const plant = getPlantById(pl.plantId);
    if (!plant) continue;
    const tasks = monthlyTasks(plant, month, offset);
    if (tasks.length === 0) continue;
    const labels = tasks.map((t) => t.label).join(", ");
    const lieu = pl.emplacement ? ` (${pl.emplacement})` : "";
    lignes.push(`• ${plant.nom}${lieu} : ${labels}`);
  }

  const aSemer = plantsByActionForMonthAdjusted("semis", month, offset).length;
  const aPlanter = plantsByActionForMonthAdjusted(
    "plantation",
    month,
    offset
  ).length;

  const body =
    (lignes.length
      ? `Vos cultures ce mois-ci :\n${lignes.join("\n")}\n\n`
      : "Pas de tâche urgente sur vos plantations ce mois-ci.\n\n") +
    `À découvrir : ${aSemer} à semer, ${aPlanter} à planter en ${moisNom}.`;

  return { title: `🌻 Mon Potager — ${moisNom}`, body };
}
