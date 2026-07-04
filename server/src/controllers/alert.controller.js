import * as alertService from "../services/alert.service.js";

export async function listAlerts(req, res, next) {
  try {
    const alerts = await alertService.getActiveAlerts();
    res.json(alerts);
  } catch (err) {
    next(err);
  }
}
