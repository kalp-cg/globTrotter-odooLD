"use client";

import React, { useState, useMemo, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { notFound } from "next/navigation";
import { 
  useAdminStats, 
  useAdminTrends, 
  useAdminTopCities, 
  useAdminTopActivities, 
  useAdminUsers,
  useToggleAdminRole,
  useDeleteAdminUser
} from "@/lib/hooks/useAdmin";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import { LuggageTag } from "@/components/ui/luggage-tag";
import { UserTripsSlideover } from "@/components/ui/user-trips-slideover";
import dynamic from "next/dynamic";
import { useVirtualizer } from "@tanstack/react-virtual";

// Dynamically import Recharts to avoid SSR hydration issues
const AdminCharts = dynamic(() => import("./admin-charts"), { 
  ssr: false,
  loading: () => <PaperSkeleton className="w-full h-[300px]" />
});

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedUserForTrips, setSelectedUserForTrips] = useState<{id: string, name: string} | null>(null);

  const { data: rawStats, isLoading: statsLoading } = useAdminStats();
  const { data: rawTrends, isLoading: trendsLoading } = useAdminTrends();
  const { data: rawTopCities, isLoading: citiesLoading } = useAdminTopCities();
  const { data: rawTopActivities, isLoading: activitiesLoading } = useAdminTopActivities();
  const { data: rawUsersData, isLoading: usersLoading } = useAdminUsers();

  const stats: any = rawStats;
  const trends: any = rawTrends;
  const topCities: any[] = Array.isArray(rawTopCities) ? rawTopCities : (rawTopCities as any)?.data || [];
  const topActivities: any[] = Array.isArray(rawTopActivities) ? rawTopActivities : (rawTopActivities as any)?.data || [];
  const usersData: any[] = Array.isArray(rawUsersData) ? rawUsersData : (rawUsersData as any)?.data || [];

  const [expandedCityId, setExpandedCityId] = useState<string | null>(null);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  const toggleRole = useToggleAdminRole();
  const deleteUser = useDeleteAdminUser();

  const parentRef = useRef<HTMLDivElement>(null);

  const filteredUsers = useMemo(() => {
    if (!usersData) return [];
    return usersData.filter((u: any) => 
      (u.email || "").toLowerCase().includes(search.toLowerCase()) || 
      (u.name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [usersData, search]);

  const rowVirtualizer = useVirtualizer({
    count: filteredUsers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  if (authLoading) return null;
  if (!user?.is_admin) return notFound();

  const isLoading = statsLoading || trendsLoading || citiesLoading || activitiesLoading || usersLoading;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-kraft/10 p-8 flex flex-col gap-8 max-w-6xl mx-auto">
        <div className="flex gap-4">
          <PaperSkeleton className="w-1/3 h-40" />
          <PaperSkeleton className="w-1/3 h-40" />
          <PaperSkeleton className="w-1/3 h-40" />
        </div>
        <PaperSkeleton className="w-full h-[400px]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-kraft/10 p-4 sm:p-8 max-w-6xl mx-auto space-y-12">
      
      <div className="border-b-2 border-dashed border-kraft pb-4">
        <h1 className="font-display text-4xl text-ink">GlobeTrotter HQ</h1>
        <p className="font-body text-ink/60 mt-1">Platform metrics and user administration.</p>
      </div>

      {/* KPI Polaroids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Total Users", value: stats?.total_users || 0, rotation: "-1deg" },
          { label: "Total Trips", value: stats?.total_trips || 0, rotation: "2deg" },
          { label: "Trips This Week", value: stats?.trips_this_week || 0, rotation: "-0.5deg" },
        ].map((kpi, i) => (
          <div 
            key={i} 
            className="bg-paper p-4 border-2 border-kraft shadow-md flex flex-col items-center justify-center transform hover:rotate-0 transition-transform"
            style={{ transform: `rotate(${kpi.rotation})` }}
          >
            <div className="w-full aspect-[4/3] bg-kraft/20 border border-ink/10 flex items-center justify-center mb-4">
              <span className="font-display text-7xl text-postal/80">{kpi.value}</span>
            </div>
            <p className="font-display text-xl text-ink uppercase tracking-widest">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Time-Series Chart */}
      <div className="bg-paper p-6 border-2 border-kraft shadow-sm">
        <h2 className="font-display text-2xl text-ink mb-6">Trips Created Over Time</h2>
        <AdminCharts trends={trends} />
      </div>

      {/* Ranked Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Cities */}
        <div className="bg-paper p-6 border-2 border-kraft shadow-sm">
          <h2 className="font-display text-2xl text-ink mb-4">Top Destinations</h2>
          <div className="space-y-3">
            {topCities?.map((city: any, i: number) => {
              const isExpanded = expandedCityId === city.id;
              return (
                <div key={city.id} className="border-b border-dashed border-kraft/50 pb-2">
                  <div 
                    className="flex justify-between items-center cursor-pointer hover:bg-kraft/10 p-2 -mx-2 rounded-sm transition-colors"
                    onClick={() => setExpandedCityId(isExpanded ? null : city.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xl text-ink/40 w-6">{i + 1}.</span>
                      <div>
                        <p className="font-display text-lg text-ink">{city.name}</p>
                        <p className="font-body text-xs text-ink/60">{city.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <LuggageTag text={`${city.stops_added_count} stops`} className="bg-moss/10 text-moss text-sm" />
                      <span className="text-ink/40 text-xs ml-2">{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-2 p-3 bg-kraft/10 border border-kraft/30 flex gap-4 text-sm font-body text-ink/80 rounded-sm shadow-inner">
                      {city.image_url && <img src={city.image_url} alt={city.name} className="w-16 h-16 object-cover border border-kraft grayscale-[20%]" />}
                      <p>{city.description || "A beautiful destination."}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Activities */}
        <div className="bg-paper p-6 border-2 border-kraft shadow-sm">
          <h2 className="font-display text-2xl text-ink mb-4">Top Activities</h2>
          <div className="space-y-3">
            {topActivities?.map((act: any, i: number) => {
              const isExpanded = expandedActivityId === act.id;
              return (
                <div key={act.id} className="border-b border-dashed border-kraft/50 pb-2">
                  <div 
                    className="flex justify-between items-center cursor-pointer hover:bg-kraft/10 p-2 -mx-2 rounded-sm transition-colors"
                    onClick={() => setExpandedActivityId(isExpanded ? null : act.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xl text-ink/40 w-6">{i + 1}.</span>
                      <div className="truncate">
                        <p className="font-display text-lg text-ink truncate max-w-[200px]">{act.name}</p>
                        <p className="font-body text-xs text-ink/60">{act.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <LuggageTag text={`${act.booking_count} planned`} className="bg-postal/10 text-postal text-sm" />
                      <span className="text-ink/40 text-xs ml-2">{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-2 p-3 bg-kraft/10 border border-kraft/30 flex gap-4 text-sm font-body text-ink/80 rounded-sm shadow-inner">
                      {act.image_url && <img src={act.image_url} alt={act.name} className="w-16 h-16 object-cover border border-kraft grayscale-[20%]" />}
                      <p>{act.description || "A wonderful activity."}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Table (Virtualized) */}
      <div className="bg-paper p-6 border-2 border-kraft shadow-sm flex flex-col h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl text-ink">User Directory</h2>
          <input 
            type="text" 
            placeholder="Search email or name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-b-2 border-dashed border-kraft focus:border-postal outline-none font-mono text-sm py-1 w-64"
          />
        </div>

        <div className="flex font-body text-xs text-ink/50 uppercase tracking-widest border-b-2 border-ink mb-2 pb-2 px-2">
          <div className="flex-1 min-w-[200px]">User</div>
          <div className="w-48 text-left hidden md:block">Email</div>
          <div className="w-32 text-center hidden sm:block">Join Date</div>
          <div className="w-16 text-right">Trips</div>
          <div className="w-64 text-right">Actions</div>
        </div>

        <div ref={parentRef} className="flex-1 overflow-y-auto">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const u = filteredUsers[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  className="flex items-center font-mono text-sm text-ink border-b border-dashed border-kraft/30 px-2 hover:bg-kraft/10 transition-colors"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div className="flex-1 min-w-[200px] truncate pr-4">{u.name} {u.is_admin && <span className="text-postal ml-2 text-xs border border-postal px-1 rounded-sm">ADMIN</span>}</div>
                  <div className="w-48 truncate pr-4 text-ink/70 hidden md:block">{u.email}</div>
                  <div className="w-32 text-center hidden sm:block">{new Date(u.created_at).toLocaleDateString()}</div>
                  <div className="w-16 text-right font-bold">{u.trips_count}</div>
                  <div className="w-64 flex justify-end gap-2 items-center">
                    <button 
                      onClick={() => setSelectedUserForTrips({ id: u.id, name: u.name })}
                      className="text-xs px-2 py-1 bg-ink/5 hover:bg-ink/10 border border-ink/20 rounded-sm transition-colors"
                    >
                      Trips
                    </button>
                    <button 
                      onClick={() => toggleRole.mutate(u.id)}
                      disabled={toggleRole.isPending}
                      className="text-xs px-2 py-1 bg-moss/10 hover:bg-moss/20 text-moss border border-moss/30 rounded-sm transition-colors disabled:opacity-50"
                    >
                      {u.is_admin ? "Demote" : "Make Admin"}
                    </button>
                    {u.id !== user?.id && (
                      <button 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to permanently delete ${u.name}?`)) {
                            deleteUser.mutate(u.id);
                          }
                        }}
                        disabled={deleteUser.isPending}
                        className="text-xs px-2 py-1 bg-postal/10 hover:bg-postal/20 text-postal border border-postal/30 rounded-sm transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {filteredUsers.length === 0 && (
            <div className="py-12 text-center font-body text-ink/40 italic">
              No users match your search.
            </div>
          )}
        </div>
      </div>

      {/* User Trips Slideover */}
      <UserTripsSlideover 
        userId={selectedUserForTrips?.id || null}
        userName={selectedUserForTrips?.name || null}
        onClose={() => setSelectedUserForTrips(null)}
      />
    </main>
  );
}
