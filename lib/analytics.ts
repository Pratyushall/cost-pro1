type AnalyticsEvent = {
  event: string;
  properties?: Record<string, any>;
};

class Analytics {
  private track(event: string, properties?: Record<string, any>) {
    // In production, this would send to your analytics service
    console.log("[Analytics]", event, properties);

    // Example: Send to Vercel Analytics or your preferred service
    if (typeof window !== "undefined" && (window as any).va) {
      (window as any).va("track", event, properties);
    }
  }

  estimatorStarted() {
    this.track("estimator_started");
  }

  stepViewed(stepName: string) {
    this.track("step_viewed", { step_name: stepName });
  }

  stepCompleted(step: number, stepName: string, data?: Record<string, any>) {
    this.track("step_completed", { step, step_name: stepName, ...data });
  }

  fieldChanged(field: string, value: any, metadata?: Record<string, any>) {
    this.track("field_changed", { field, value, ...metadata });
  }

  deriveAreaFromBhk(bhk: string, sqft: number) {
    this.track("derive_area_from_bhk", { bhk, sqft });
  }

  skipAreaClicked(reason: string) {
    this.track("skip_area_clicked", { reason });
  }

  clickNext(payload: Record<string, any>) {
    this.track("click_next", payload);
  }

  inputParseError(field: string, input: string, error: string) {
    this.track("input_parse_error", { field, input, error });
  }

  timeOnStep(step: number, stepName: string, milliseconds: number) {
    this.track("time_on_step", {
      step,
      step_name: stepName,
      time_on_step_ms: milliseconds,
    });
  }

  singleScopeToggled(item: string, enabled: boolean) {
    this.track("single_scope_toggled", { item, enabled });
  }

  singleScopePresetClicked(item: string, preset: string) {
    this.track("single_scope_preset_clicked", { item, preset });
  }

  singleAreaModeChanged(item: string, mode: string) {
    this.track("single_area_mode_changed", { item, mode });
  }

  singleAreaChanged(item: string, value: string) {
    this.track("single_area_changed", { item, value });
  }

  pkgOverrideSet(item: string, pkg: string) {
    this.track("pkg_override_set", { item, pkg });
  }

  pkgOverrideReset(item: string) {
    this.track("pkg_override_reset", { item });
  }

  roomShortcutClicked(shortcut: string) {
    this.track("room_shortcut_clicked", { shortcut });
  }

  applyToAllClicked(action: string) {
    this.track("apply_to_all_clicked", { action });
  }

  nextClicked(step: string, metadata: Record<string, any>) {
    this.track("next_clicked", { step, ...metadata });
  }

  roomsStepViewed() {
    this.track("rooms_step_viewed");
  }

  roomPresetClicked(room: string, preset: string) {
    this.track("room_preset_clicked", { room, preset });
  }

  roomSizeChanged(room: string, size: string) {
    this.track("room_size_changed", { room, size });
  }

  itemToggled(room: string, item: string, enabled: boolean) {
    this.track("item_toggled", { room, item, enabled });
  }

  itemPkgOverrideSet(room: string, item: string, pkg: string) {
    this.track("item_pkg_override_set", { room, item, pkg });
  }

  itemPkgOverrideReset(room: string, item: string) {
    this.track("item_pkg_override_reset", { room, item });
  }

  kitchenAccessoryQtyChanged(name: string, qty: number) {
    this.track("kitchen_accessory_qty_changed", { name, qty });
  }

  bulkActionClicked(action: string) {
    this.track("bulk_action_clicked", { action });
  }

  bedroomAdded(role: string) {
    this.track("bedroom_added", { role });
  }

  bedroomRemoved(role: string) {
    this.track("bedroom_removed", { role });
  }

  bedroomRoleChanged(oldRole: string, newRole: string) {
    this.track("bedroom_role_changed", {
      old_role: oldRole,
      new_role: newRole,
    });
  }

  tvPanelModeChanged(mode: string) {
    this.track("tv_panel_mode_changed", { mode });
  }

  tvPanelPresetClicked(preset: string) {
    this.track("tv_panel_preset_clicked", { preset });
  }

  addonsStepViewed() {
    this.track("addons_step_viewed");
  }

  addonToggled(key: string, enabled: boolean) {
    this.track(`addon_toggled:${key}:${enabled}`);
  }

  addonQtyChanged(key: string, qty: number) {
    this.track(`addon_qty_changed:${key}:${qty}`);
  }

  addonPresetClicked(key: string, preset: string) {
    this.track(`addon_preset_clicked:${key}:${preset}`);
  }

  bundleClicked(bundle: string) {
    this.track(`bundle_clicked:${bundle}`);
  }

  addonPkgOverrideSet(key: string, pkg: string) {
    this.track(`addon_pkg_override_set:${key}:${pkg}`);
  }

  addonPkgOverrideReset(key: string) {
    this.track(`addon_pkg_override_reset:${key}`);
  }

  otpStarted(phone: string) {
    this.track("otp_started", { phone });
  }

  otpSendClicked(phone: string, method: string) {
    this.track("otp_send_clicked", { phone, method });
  }

  otpSentOk(phone: string, method: string) {
    this.track("otp_sent_ok", { phone, method });
  }

  otpSentFail(phone: string, method: string, reason: string) {
    this.track("otp_sent_fail", { phone, method, reason });
  }

  otpResend(phone: string, method: string) {
    this.track("otp_resend", { phone, method });
  }

  otpVerifyClicked(phone: string) {
    this.track("otp_verify_clicked", { phone });
  }

  otpVerifiedOk(phone: string, payload: Record<string, any>) {
    this.track("otp_verified_ok", { phone, ...payload });
  }

  otpVerifiedFail(phone: string, reason: string) {
    this.track("otp_verified_fail", { phone, reason });
  }

  otpChangeNumber() {
    this.track("otp_change_number");
  }

  estimateViewed(payload: Record<string, any>) {
    this.track("estimate_viewed", payload);
  }

  pdfPreviewOpened(payload: Record<string, any>) {
    this.track("pdf_preview_opened", payload);
  }

  pdfDownloadClicked(payload: Record<string, any>) {
    this.track("pdf_download_clicked", payload);
  }

  pdfPrintClicked(payload: Record<string, any>) {
    this.track("pdf_print_clicked", payload);
  }

  shareClicked(channel: string, payload: Record<string, any>) {
    this.track("share_clicked", { channel, ...payload });
  }

  calcApiFallback(reason: string, payload: Record<string, any>) {
    this.track("calc_api_fallback", { reason, ...payload });
  }

  estimateGenerated(basics: any, grandTotal: any) {
    this.track("estimate_generated", {
      bhk: basics.bhk,
      pkg: basics.pkg,
      sqft: basics.carpetAreaSqft,
      sqftSource: basics.areaSource,
      grandLow: grandTotal.low,
      grandHigh: grandTotal.high,
    });
  }

  pdfDownloaded(basics: any, payload: Record<string, any>) {
    this.track("pdf_downloaded", {
      bhk: basics.bhk,
      pkg: basics.pkg,
      sqft: basics.carpetAreaSqft,
      ...payload,
    });
  }

  adViewed(adId: string, variant: string) {
    this.track("ad_viewed", { ad_id: adId, variant });
  }

  adClicked(adId: string, variant: string, destination: string) {
    this.track("ad_clicked", { ad_id: adId, variant, destination });
  }

  resetClicked(stepName: string) {
    this.track("reset_clicked", { step_name: stepName });
  }
}

export const analytics = new Analytics();
