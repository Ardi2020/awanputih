"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import {
  Cloud,
  Menu,
  X,
  UserCheck,
  FileText,
  Users,
  CheckSquare,
  BarChart3,
  Shield,
  Calendar,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const { currentUser, allUsers, setCurrentUser, periode } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Dynamic Navigation per Role (FR-001)
  const getNavLinks = () => {
    switch (currentUser.role) {
      case "Guru":
        return [
          { href: "/", label: "Pekerjaan Saya", icon: CheckSquare },
          { href: "/halaqah", label: "Halaqah Saya", icon: Users },
          { href: "/anggota", label: "Anggota Saya", icon: UserCheck },
          { href: "/laporan", label: "Laporan Saya", icon: FileText },
          { href: "/pengajuan", label: "Pengajuan Saya", icon: FileText },
        ];
      case "Asmen":
        return [
          { href: "/", label: "Ringkasan Binaan", icon: BarChart3 },
          { href: "/halaqah", label: "Kelompok Binaan", icon: Users },
          { href: "/laporan", label: "Laporan Binaan", icon: FileText },
          { href: "/pengajuan", label: "Validasi Perhalaqahan", icon: CheckSquare },
        ];
      case "Manager":
        return [
          { href: "/", label: "Ringkasan Mahali", icon: BarChart3 },
          { href: "/rekap", label: "Rekap Mahali", icon: BarChart3 },
          { href: "/laporan", label: "Status Pelaporan", icon: FileText },
        ];
      case "Admin":
        return [
          { href: "/", label: "Dashboard", icon: BarChart3 },
          { href: "/admin", label: "Akun & Penugasan", icon: Shield },
          { href: "/admin#audit", label: "Audit Log", icon: FileText },
        ];
      default:
        return [{ href: "/", label: "Beranda", icon: CheckSquare }];
    }
  };

  const navLinks = getNavLinks();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Guru":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Asmen":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Manager":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Admin":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Demo Switcher Ribbon */}
      <div className="bg-slate-900 text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-300">Simulasi Role (PRD Tester):</span>
          <span className="font-semibold text-white">{currentUser.name}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeColor(currentUser.role)}`}>
            {currentUser.role}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{periode.label}</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="touch-target px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 font-medium border border-slate-700 text-xs transition"
            >
              <span>Ganti Akun</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-1 w-64 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50"
                onClick={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Pilih Akun Sintetis
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setCurrentUser(u)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      u.id === currentUser.id ? "bg-emerald-50 text-emerald-900 font-semibold" : ""
                    }`}
                  >
                    <div>
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.email}</div>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeColor(u.role)}`}>
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:bg-emerald-700 transition">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Awan<span className="text-emerald-600">putih</span>
                </span>
                <span className="block text-[10px] font-medium text-slate-500 tracking-wider uppercase">
                  Laporan & Perhalaqahan
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`touch-target px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
                {currentUser.avatar || currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left text-xs">
                <div className="font-semibold text-slate-900 truncate max-w-[140px]">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser.role}</div>
              </div>
            </div>

            {/* Mobile Hamburger Button (NFR-003: >= 44x44px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="touch-target p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden flex items-center justify-center"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (NFR-003) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-300">
                {currentUser.avatar || currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{currentUser.name}</div>
                <div className="text-xs text-slate-500">{currentUser.email}</div>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getRoleBadgeColor(currentUser.role)}`}>
              {currentUser.role}
            </span>
          </div>

          <nav className="p-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`touch-target px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3 transition ${
                    isActive
                      ? "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/20"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
