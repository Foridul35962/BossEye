import cron from "node-cron";
import * as alertService from "../services/alert.service.js";
import * as powerService from "../services/power.service.js";
import * as socketService from "../services/socket.service.js";

function startAlertCron() {
  cron.schedule("*/5 * * * *", async () => {
    try {
      await powerService.recordSnapshot();

      const newAlerts = await alertService.checkAlerts({
        onNewAlert: (alert) => socketService.emitAlertCreated(alert),
      });

      if (newAlerts.length > 0) {
        console.log(`[cron] ${newAlerts.length} new alert(s) raised.`);
      }
    } catch (err) {
      console.error("[cron] alert/power tick failed:", err.message);
    }
  });

  console.log("[cron] alert + power-snapshot job scheduled (every 5 min).");
}

export default startAlertCron;
