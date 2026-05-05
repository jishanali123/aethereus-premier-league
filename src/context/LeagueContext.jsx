import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import initialPlayers from '../data/players.json';
import initialTeams from '../data/teams.json';
import initialSponsors from '../data/sponsors.json';

const STORAGE_KEY = 'apl-league-data';
const DATA_VERSION = 25;

const LeagueContext = createContext(null);

function loadStoredData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed._v === DATA_VERSION) return parsed;
    }
  } catch {
    /* corrupted data — fall through */
  }
  return null;
}

function persist(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, _v: DATA_VERSION }));
}

export function LeagueProvider({ children }) {
  const [data, setData] = useState(() => {
    const stored = loadStoredData();
    return {
      players: stored?.players ?? initialPlayers,
      teams: stored?.teams ?? initialTeams,
      sponsors: stored?.sponsors ?? initialSponsors,
    };
  });

  const update = useCallback((updater) => {
    setData((prev) => {
      const next = updater(prev);
      persist(next);
      return next;
    });
  }, []);

  const updatePlayer = useCallback(
    (id, changes) =>
      update((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === id ? { ...p, ...changes } : p,
        ),
      })),
    [update],
  );

  const addPlayer = useCallback(
    (player) =>
      update((prev) => ({
        ...prev,
        players: [
          ...prev.players,
          { ...player, id: Math.max(0, ...prev.players.map((p) => p.id)) + 1 },
        ],
      })),
    [update],
  );

  const deletePlayer = useCallback(
    (id) =>
      update((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.id !== id),
      })),
    [update],
  );

  const updateSponsor = useCallback(
    (id, changes) =>
      update((prev) => ({
        ...prev,
        sponsors: prev.sponsors.map((s) =>
          s.id === id ? { ...s, ...changes } : s,
        ),
      })),
    [update],
  );

  const addSponsor = useCallback(
    (sponsor) =>
      update((prev) => ({
        ...prev,
        sponsors: [
          ...prev.sponsors,
          { ...sponsor, id: Math.max(0, ...prev.sponsors.map((s) => s.id)) + 1 },
        ],
      })),
    [update],
  );

  const deleteSponsor = useCallback(
    (id) =>
      update((prev) => ({
        ...prev,
        sponsors: prev.sponsors.filter((s) => s.id !== id),
      })),
    [update],
  );

  const resetAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData({
      players: initialPlayers,
      teams: initialTeams,
      sponsors: initialSponsors,
    });
  }, []);

  const resetAuction = useCallback(
    () =>
      update((prev) => ({
        ...prev,
        players: prev.players.map((p) => ({
          ...p,
          sold: false,
          price: 0,
          team: null,
        })),
      })),
    [update],
  );

  const teamStats = useMemo(() => {
    const map = {};
    for (const t of data.teams) {
      const roster = data.players.filter((p) => p.team === t.name);
      const spent = roster.reduce((sum, p) => sum + (p.price || 0), 0);
      map[t.name] = {
        ...t,
        roster,
        spent,
        remaining: t.totalPurse - spent,
        count: roster.length,
      };
    }
    return map;
  }, [data.players, data.teams]);

  const value = useMemo(
    () => ({
      players: data.players,
      teams: data.teams,
      sponsors: data.sponsors,
      teamStats,
      updatePlayer,
      addPlayer,
      deletePlayer,
      updateSponsor,
      addSponsor,
      deleteSponsor,
      resetAllData,
      resetAuction,
    }),
    [
      data,
      teamStats,
      updatePlayer,
      addPlayer,
      deletePlayer,
      updateSponsor,
      addSponsor,
      deleteSponsor,
      resetAllData,
      resetAuction,
    ],
  );

  return (
    <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>
  );
}

export function useLeague() {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error('useLeague must be used inside <LeagueProvider>');
  return ctx;
}

export function formatPrice(amount) {
  if (!amount) return 'Unsold';
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}
