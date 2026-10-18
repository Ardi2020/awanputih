import {
  User,
  Halaqah,
  LaporanPekanan,
  PengajuanHalaqah,
  ActionPlan,
  PrioritasMasalah,
  IltizamatRecord,
  Pemuda,
} from "./types";

/**
 * Evaluates whether a user is allowed to access a specific halaqah
 */
export function canAccessHalaqah(user: User, halaqah: Halaqah): boolean {
  if (!user) return false;
  switch (user.role) {
    case "Guru":
      return halaqah.guruId === user.id || user.assignedHalaqahIds.includes(halaqah.id);
    case "Asmen":
      return halaqah.asmenId === user.id || user.supervisedHalaqahIds.includes(halaqah.id);
    case "Manager":
    case "PJ Mal":
      return !user.mahaliId || halaqah.mahaliId === user.mahaliId;
    case "Admin":
      return true;
    default:
      return false;
  }
}

/**
 * Filter list of halaqahs strictly scoped by role and server assignments
 */
export function filterHalaqahsByScope(user: User, halaqahs: Halaqah[]): Halaqah[] {
  if (!user) return [];
  switch (user.role) {
    case "Guru":
      return halaqahs.filter(
        (h) => h.guruId === user.id || user.assignedHalaqahIds.includes(h.id)
      );
    case "Asmen":
      return halaqahs.filter(
        (h) => h.asmenId === user.id || user.supervisedHalaqahIds.includes(h.id)
      );
    case "Manager":
    case "PJ Mal":
      return halaqahs.filter((h) => !user.mahaliId || h.mahaliId === user.mahaliId);
    case "Admin":
      return halaqahs;
    default:
      return [];
  }
}

/**
 * Filter list of reports strictly scoped by role and server assignments
 */
export function filterReportsByScope(user: User, reports: LaporanPekanan[]): LaporanPekanan[] {
  if (!user) return [];
  switch (user.role) {
    case "Guru":
      return reports.filter((r) => r.guruId === user.id);
    case "Asmen":
      return reports.filter((r) => r.asmenId === user.id);
    case "Manager":
    case "PJ Mal":
      return reports.filter((r) => !user.mahaliId || r.mahaliId === user.mahaliId);
    case "Admin":
      return reports;
    default:
      return [];
  }
}

/**
 * Filter list of proposals strictly scoped by role and server assignments
 */
export function filterPengajuanByScope(user: User, items: PengajuanHalaqah[]): PengajuanHalaqah[] {
  if (!user) return [];
  switch (user.role) {
    case "Guru":
      return items.filter((p) => p.pemohonId === user.id);
    case "Asmen":
      return items.filter((p) => p.asmenId === user.id);
    case "Manager":
      return items;
    case "Admin":
      return items;
    default:
      return [];
  }
}

/**
 * Filter Action Plans / Tugas by user role & scope
 */
export function filterActionPlansByScope(user: User, plans: ActionPlan[]): ActionPlan[] {
  if (!user) return [];
  switch (user.role) {
    case "Guru":
      return plans.filter((p) => p.picId === user.id);
    case "Asmen":
      return plans.filter((p) => p.picId === user.id || p.pemberiId === user.id || p.asmenId === user.id);
    case "Manager":
    case "Admin":
      return plans;
    default:
      return [];
  }
}

/**
 * Filter Priority Problems by user role & scope
 */
export function filterPrioritasByScope(user: User, items: PrioritasMasalah[]): PrioritasMasalah[] {
  if (!user) return [];
  switch (user.role) {
    case "Guru":
      return items.filter((p) => p.guruId === user.id);
    case "Asmen":
      return items.filter((p) => p.asmenId === user.id);
    case "Manager":
    case "Admin":
      return items;
    default:
      return [];
  }
}

/**
 * Filter Pemuda by user role & scope (Guru cannot see youth outside their groups)
 */
export function filterPemudasByScope(
  user: User,
  pemudas: Pemuda[],
  scopedHalaqahs: Halaqah[]
): Pemuda[] {
  if (!user) return [];
  if (user.role === "Admin" || user.role === "Manager" || user.role === "PJ Mal") {
    return pemudas;
  }
  const allowedIds = scopedHalaqahs.map((h) => h.id);
  return pemudas.filter((p) => allowedIds.includes(p.halaqahId));
}

/**
 * Filter Iltizamat records by role
 */
export function filterIltizamatByScope(user: User, items: IltizamatRecord[]): IltizamatRecord[] {
  if (!user) return [];
  switch (user.role) {
    case "Guru":
      return items.filter((i) => i.guruId === user.id);
    case "Asmen":
      return items.filter((i) => i.asmenId === user.id);
    case "PJ Mal":
    case "Manager":
    case "Admin":
      return items;
    default:
      return [];
  }
}

/**
 * Rule: Guru fills/submits report for their own halaqah only
 */
export function canSubmitReport(user: User, halaqahId: string, halaqahs: Halaqah[]): boolean {
  if (!user || user.role !== "Guru") return false;
  const halaqah = halaqahs.find((h) => h.id === halaqahId);
  if (!halaqah) return false;
  return halaqah.guruId === user.id || user.assignedHalaqahIds.includes(halaqahId);
}

/**
 * Rule: Asmen validates proposals in their supervision scope.
 * Self-approval is strictly forbidden (FR-006).
 */
export function canReviewPengajuan(user: User, pengajuan: PengajuanHalaqah): boolean {
  if (!user || user.role !== "Asmen") return false;
  if (pengajuan.pemohonId === user.id) return false;
  return pengajuan.asmenId === user.id;
}

/**
 * Rule: Only Admin can manage accounts, roles, and assignments
 */
export function canManageAdmin(user: User): boolean {
  return !!user && user.role === "Admin";
}
