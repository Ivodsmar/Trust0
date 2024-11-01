'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Interest = {
  buy: string[];
  sell: string[];
  finance: string[];
  inUseFunds?: number;
};

export type Profile = {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  balance: number;
  type: 'trader' | 'financier';
  interests: Interest;
  totalFunds?: number;
  availableFunds?: number;
  loans?: { [financierId: string]: number };
  inUseFunds?: number;
};

type ProfileContextType = {
  profiles: Profile[];
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  currentProfile: Profile | null;
  setCurrentProfile: (profile: Profile | null) => void;
  updateProfileBalance: (id: string, newBalance: number) => void;
  addProfile: (profile: Omit<Profile, 'id'>) => void;
  getProfileById: (id: string) => Profile | undefined;
  updateFinancierFunds: (traderId: string, financierId: string, loanAmount: number) => void;
  updateProfileInterests: (id: string, newInterests: Interest) => void;
  repayLoan: (traderId: string, financierId: string, amount: number) => void;
  updateProfileLoans: (traderId: string, loans: { [financierId: string]: number }) => void; // new function
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
};

const initialProfiles: Profile[] = [
  { id: '1', name: 'Trader A', balance: 100000, type: 'trader', interests: { buy: ['Oil', 'Gold'], sell: ['Silver'], finance: [] }, loans: {} },
  { id: '2', name: 'Trader B', balance: 150000, type: 'trader', interests: { buy: ['Natural Gas'], sell: ['Copper'], finance: [] }, loans: {} },
  { id: '3', name: 'Financier X', balance: 500000, type: 'financier', totalFunds: 500000, availableFunds: 500000, interests: { buy: [], sell: [], finance: ['Invoice Financing', 'Trade Finance'] } },
];

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    if (typeof window !== 'undefined') {
      const storedProfiles = localStorage.getItem('profiles');
      return storedProfiles ? JSON.parse(storedProfiles) : initialProfiles;
    }
    return initialProfiles;
  });

  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (profiles.length > 0 && !currentProfile) {
      setCurrentProfile(profiles[0]);
    }
  }, [profiles, currentProfile]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profiles', JSON.stringify(profiles));
    }
  }, [profiles]);

  const updateProfileBalance = (id: string, newBalance: number) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(profile =>
        profile.id === id
          ? {
              ...profile,
              balance: newBalance,
              availableFunds: profile.type === 'financier' ? newBalance : undefined,
              totalFunds: profile.type === 'financier' ? (profile.totalFunds || newBalance) : undefined
            }
          : profile
      )
    )
    if (currentProfile && currentProfile.id === id) {
      setCurrentProfile(prevProfile => ({
        ...prevProfile!,
        balance: newBalance,
        availableFunds: prevProfile!.type === 'financier' ? newBalance : undefined,
        totalFunds: prevProfile!.type === 'financier' ? (prevProfile!.totalFunds || newBalance) : undefined
      }))
    }
  }

  const addProfile = (profile: Omit<Profile, 'id'>) => {
    const newProfile: Profile = {
      ...profile,
      id: Date.now().toString(),
      totalFunds: profile.type === 'financier' ? profile.balance : undefined,
      availableFunds: profile.type === 'financier' ? profile.balance : undefined,
      loans: profile.type === 'trader' ? {} : undefined,
    }
    setProfiles(prevProfiles => [...prevProfiles, newProfile])
  }

  const getProfileById = (id: string) => {
    return profiles.find(profile => profile.id === id)
  }

  const updateFinancierFunds = (traderId: string, financierId: string, loanAmount: number) => {
    setProfiles((prevProfiles) =>
      prevProfiles.map((profile) => {
        if (profile.id === financierId && profile.type === 'financier') {
          if (profile.availableFunds && profile.availableFunds >= loanAmount) {
            const newInUseFunds = (profile.inUseFunds || 0) + loanAmount;
            return {
              ...profile,
              balance: profile.balance - loanAmount,
              availableFunds: profile.availableFunds - loanAmount,
              inUseFunds: newInUseFunds,
            };
          } else {
            console.error("O financiador não possui fundos suficientes.");
            return profile;
          }
        }

        if (profile.id === traderId && profile.type === 'trader') {
          const updatedLoans = {
            ...profile.loans,
            [financierId]: (profile.loans?.[financierId] || 0) + loanAmount,
          };
          return {
            ...profile,
            loans: updatedLoans,
            balance: profile.balance + loanAmount,
          };
        }

        return profile;
      })
    );
  };

  const repayLoan = (traderId: string, financierId: string, amount: number) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(profile => {
        if (profile.id === traderId && profile.type === 'trader') {
          const updatedLoans = {
            ...profile.loans,
            [financierId]: Math.max((profile.loans?.[financierId] || 0) - amount, 0)
          };
          return { ...profile, balance: profile.balance - amount, loans: updatedLoans };
        }
        if (profile.id === financierId && profile.type === 'financier') {
          const updatedAvailableFunds = (profile.availableFunds || 0) + amount;
          return { ...profile, balance: profile.balance + amount, availableFunds: updatedAvailableFunds };
        }
        return profile;
      })
    );
  };

  const updateProfileLoans = (traderId: string, loans: { [financierId: string]: number }) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(profile =>
        profile.id === traderId && profile.type === 'trader'
          ? { ...profile, loans: { ...profile.loans, ...loans } }
          : profile
      )
    );
  };

  const updateProfileInterests = (id: string, newInterests: Interest) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(profile =>
        profile.id === id ? { ...profile, interests: newInterests } : profile
      )
    )
    if (currentProfile && currentProfile.id === id) {
      setCurrentProfile(prevProfile => ({
        ...prevProfile!,
        interests: newInterests
      }))
    }
  }

  return (
    <ProfileContext.Provider 
      value={{ 
        profiles,
        setProfiles,
        currentProfile,
        setCurrentProfile,
        updateProfileBalance,
        addProfile,
        getProfileById,
        updateFinancierFunds,
        updateProfileInterests,
        repayLoan,
        updateProfileLoans // added to context
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
