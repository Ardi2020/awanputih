import { User, Halaqah, LaporanPekanan, PengajuanHalaqah } from "./types";

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
      return halaqah.mahaliId === user.mahaliId;
    case "Admin":
      // FR-002: Admin does not automatically have operational access
      return false;
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
      return halaqahs.filter((h) => h.mahaliId === user.mahaliId);
    case "Admin":
      return []; // Admin only administrates accounts/assignments, not operational halaqah master
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
      return reports.filter((r) => r.mahaliId === user.mahaliId);
    case "Admin":
      return []; // Denied operational reports by default
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
      return []; // Not in manager scope
    case "Admin":
      return items; // Admin can view technical audit of proposals
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
  // Proposer cannot self-approve
  if (pengajuan.pemohonId === user.id) return false;
  // Must be assigned reviewer
  return pengajuan.asmenId === user.id;
}

/**
 * Rule: Only Admin can manage accounts, roles, and assignments
 */
export function canManageAdmin(user: User): boolean {
  return !!user && user.role === "Admin";
}
