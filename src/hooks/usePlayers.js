import { useState, useMemo } from 'react';
import playersData from '../data/players.json';

export function usePlayers() {
  const [players] = useState(playersData);
  const [loading] = useState(false);
  const [error] = useState(null);

  return { players, loading, error };
}

export function usePlayer(id) {
  const numericId = Number(id);
  const player = useMemo(
    () => playersData.find((p) => p.id === numericId) ?? null,
    [numericId]
  );

  return {
    player,
    loading: false,
    error: player ? null : `Player with ID ${id} not found`,
  };
}

export function getTeams() {
  return [...new Set(playersData.map((p) => p.team).filter(Boolean))];
}

export function getRoles() {
  return [...new Set(playersData.map((p) => p.role))];
}

export function formatPrice(amount) {
  if (!amount) return 'Unsold';
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}
