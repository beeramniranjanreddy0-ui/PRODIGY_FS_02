import React from 'react';
import { EmployeeStats } from '../types';
import { Users, UserCheck, UserX, Building2 } from 'lucide-react';

interface StatsCardsProps {
  stats: EmployeeStats | null;
  loading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  const cards = [
    {
      label: 'TOTAL EMPLOYEES',
      value: stats ? stats.total : 0,
      icon: Users,
      description: 'Registered organization staff',
    },
    {
      label: 'ACTIVE STATUS',
      value: stats ? stats.active : 0,
      icon: UserCheck,
      description: 'Currently on active duty',
    },
    {
      label: 'INACTIVE STATUS',
      value: stats ? stats.inactive : 0,
      icon: UserX,
      description: 'On leave or departed',
    },
    {
      label: 'DEPARTMENTS',
      value: stats ? stats.departments_count : 0,
      icon: Building2,
      description: 'Functional business units',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="border border-zinc-200 bg-white p-4 transition-all duration-150 hover:border-black"
          >
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-600">
                {card.label}
              </span>
              <Icon
                className="w-4 h-4 text-zinc-400"
                style={idx === 0 ? { backgroundColor: '#ffffff' } : undefined}
              />
            </div>
            <div className="text-2xl font-bold tracking-tight text-black">
              {loading ? (
                <div className="h-8 w-16 bg-zinc-100 animate-pulse" />
              ) : (
                card.value
              )}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {card.description}
            </div>
          </div>
        );
      })}
    </div>
  );
};
