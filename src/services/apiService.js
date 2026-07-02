// フロント -> バックエンドの API 呼び出しラッパー。
// フロントからバックエンドへ送る API 通信だけをまとめるラッパー。
// Square 設定、売り切れ取得、注文作成、決済、注文取得をこの 1 ファイルに集約する。

import { API_ENDPOINTS, SOLDOUT_FETCH_IDS } from "../constants/config";
import { SQUARE_FALLBACK_CONFIG } from "../constants/config";
import { applySoldoutRules } from "../features/soldout/soldoutPolicy";

function isValidAppId(id) {
  if (!id || typeof id !== "string") return false;
  const s = id.trim();
  return /^((sq0idp-|sq0idb-|sandbox-).+)/i.test(s);
}

export const Api = {
  // Square の applicationId / locationId / environment を取得する。
  async getSquareConfig() {
    try {
      const res = await fetch(API_ENDPOINTS.SQUARE_CONFIG, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const ctype = (res.headers.get("content-type") || "").toLowerCase();
        if (ctype.includes("application/json")) {
          try {
            const cfg = await res.json();
            const appId = (cfg?.applicationId ?? "").toString().trim();
            const loc = (cfg?.locationId ?? "").toString().trim();
            const env = (cfg?.environment ?? "").toString().trim();
            if (isValidAppId(appId)) {
              return {
                applicationId: appId,
                locationId: loc || SQUARE_FALLBACK_CONFIG.locationId,
                environment: env || SQUARE_FALLBACK_CONFIG.environment,
              };
            } else {
              console.warn(
                "getSquareConfig: invalid applicationId in /api/square/config JSON:",
                appId
              );
            }
          } catch (e) {
            console.warn(
              "getSquareConfig: failed to parse JSON from /api/square/config:",
              e
            );
          }
        } else {
          console.warn(
            "getSquareConfig: /api/square/config returned non-JSON content-type:",
            ctype
          );
        }
      } else {
        console.warn(
          "getSquareConfig: /api/square/config returned not ok:",
          res.status
        );
      }
    } catch (e) {
      console.warn("getSquareConfig: fetch error /api/square/config:", e);
    }

    // 2) 旧実装互換: テキストで ApplicationId を返す endpoint を試す。
    try {
      const res2 = await fetch("/api/payment/get/ApplicationId");
      if (res2.ok) {
        const text = (await res2.text()).trim();
        if (isValidAppId(text)) {
          return {
            applicationId: text,
            locationId: SQUARE_FALLBACK_CONFIG.locationId,
            environment: SQUARE_FALLBACK_CONFIG.environment,
          };
        } else {
          console.warn(
            "getSquareConfig: /api/payment/get/ApplicationId returned invalid id:",
            text
          );
        }
      } else {
        console.warn(
          "getSquareConfig: /api/payment/get/ApplicationId returned not ok:",
          res2.status
        );
      }
    } catch (e) {
      console.warn(
        "getSquareConfig: fetch error /api/payment/get/ApplicationId:",
        e
      );
    }

    // 3) 最後はフロント内 fallback で継続する。
    console.warn("getSquareConfig: using SQUARE_FALLBACK_CONFIG (development only)");
    return { ...SQUARE_FALLBACK_CONFIG };
  },

  // 売り切れ状態を取得し、セット商品の連動ルールを反映する。
  // 各エンドポイント: GET /api/items/get/byitemId/{itemId}
  // 返り値: { soldout: { "<itemId>": true|false, ... } }
  async fetchSoldoutMap() {
    const soldout = {};

    for (const id of SOLDOUT_FETCH_IDS) {
      try {
        const res = await fetch(API_ENDPOINTS.ITEM_BY_ID(id));
        if (!res.ok) {
          soldout[id] = false;
          continue;
        }
        // 明示的に available: false のときだけ売切れ
        const item = await res.json();
        soldout[id] = item?.available === false;
      } catch (e) {
        soldout[id] = false;
        console.warn(`fetchSoldoutMap: network error for item ${id}`, e);
      }
    }

    return applySoldoutRules(soldout);
  },

  // 注文を作成する。
  // 注文作成: POST /api/order/set
  // 送るボディは backend の OrderRequest DTO に合わせる必要あり。
  // 要件に合わせ、orderDate（作成日時）, reservedTime（LocalDateTime形式）, items（[{itemId,quantity}]）を送る。
  async createOrder({ items, orderDate, reservedTime, amount }) {
    const body = {
      orderDate,// LocalDateTime-ish string "yyyy-MM-dd'T'HH:mm:ss"
      reservedTime, // LocalDateTime-ish string
      items,// array of { itemId, quantity } filtered by buildOrderItems on frontend
      amount,
    };
    const res = await fetch(API_ENDPOINTS.ORDER_CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("createOrder failed:", res.status, text);
      throw new Error("注文作成に失敗しました");
    }
    return res.json();
  },

  // Square の sourceId を使って決済を実行する。
  // backend defines: POST /api/payment/create/{orderId}/{sourceId}
  async chargeOrder({ orderId, sourceId }) {
    const url = API_ENDPOINTS.PAYMENT_CHARGE(orderId, sourceId);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("chargeOrder failed:", res.status, text);
      throw new Error("決済APIが失敗しました");
    }
    return res.json(); // { status:"APPROVED"|"DECLINED", receiptUrl?, error? }
  },

  // 注文情報を取得する。
  // backend has: GET /api/order/get/byorderId/{orderId}
  async fetchOrder(orderId) {
    const res = await fetch(API_ENDPOINTS.ORDER_GET(orderId));
    if (!res.ok) throw new Error("注文取得に失敗しました");
    return res.json();
  },
};