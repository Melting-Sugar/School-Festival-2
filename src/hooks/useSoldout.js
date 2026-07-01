import { useCallback, useEffect, useState } from "react";

import { INITIAL_UI_STATE } from "../constants/initialState";
import { Api } from "../services/apiService";

export function useSoldout(step) {
  const [isSoldout, setIsSoldout] = useState(INITIAL_UI_STATE.isSoldout);

  const refreshSoldout = useCallback(async () => {
    try {
      const { soldout } = await Api.fetchSoldoutMap();
      setIsSoldout(soldout);
    } catch (e) {
      console.warn("useSoldout: fetchSoldoutMap failed", e);
    }
  }, []);

  useEffect(() => {
    if (step === "menu") {
      refreshSoldout();
    }
  }, [step, refreshSoldout]);

  return { isSoldout, setIsSoldout, refreshSoldout };
}