import { NextRequest, NextResponse } from "next/server";
import { initialHalaqahs, initialUsers } from "@/lib/store";
import { filterHalaqahsByScope } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId") || "usr-guru-1";
  const user = initialUsers.find((u) => u.id === userId);

  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  // Server-side strict scope filter (FR-002)
  const scoped = filterHalaqahsByScope(user, initialHalaqahs);

  return NextResponse.json({
    user: { id: user.id, name: user.name, role: user.role },
    count: scoped.length,
    halaqahs: scoped,
  });
}
