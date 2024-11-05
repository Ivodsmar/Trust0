'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Interest {
  buy: string[];
  sell: string[];
  finance: string[];
}

interface Profile {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  balance: number;
  type: 'trader' | 'financier';
  interests?: Interest;
  loans?: { [financierId: string]: number };
  availableFunds?: number;
  totalFunds?: number;
}

interface ProfileContextType {
  profiles: Profile[];
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  currentProfile: Profile | null;
  setCurrentProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  updateProfileBalance: (id: string, newBalance: number) => void;
  addProfile: (profile: Profile) => void;
  getProfileById: (id: string) => Profile | undefined;
  updateFinancierFunds: (traderId: string, financierId: string, loanAmount: number) => void;
  updateProfileInterests: (id: string, interests: Interest) => void;
  repayLoan: (traderId: string, financierId: string, amount: number) => void;
}

const initialProfiles: Profile[] = [
  { 
    id: '1', 
    name: 'Trader A', 
    balance: 100000, 
    type: 'trader', 
    interests: { buy: ['Oil', 'Gold'], sell: ['Silver'], finance: [] }
  },
  { 
    id: '2', 
    name: 'Trader B', 
    balance: 150000, 
    type: 'trader', 
    interests: { buy: ['Natural Gas'], sell: ['Copper'], finance: [] }
  },
  { 
    id: '3', 
    name: 'Financier X', 
    balance: 500000, 
    type: 'financier', 
    totalFunds: 500000, 
    availableFunds: 500000, 
    interests: { buy: [], sell: [], finance: ['Invoice Financing', 'Trade Finance'] }
  },
];

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

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
    );

    if (currentProfile && currentProfile.id === id) {
      setCurrentProfile(prevProfile => ({
        ...prevProfile!,
        balance: newBalance,
        availableFunds: prevProfile!.type === 'financier' ? newBalance : undefined,
        totalFunds: prevProfile!.type === 'financier' ? (prevProfile!.totalFunds || newBalance) : undefined
      }));
    }
  };

  const updateFinancierFunds = (traderId: string, financierId: string, loanAmount: number) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(profile => {
        if (profile.id === traderId && profile.type === 'trader') {
          const newLoans = { 
            ...profile.loans, 
            [financierId]: (profile.loans?.[financierId] || 0) + loanAmount 
          };
          return { ...profile, loans: newLoans };
        }
        if (profile.id === financierId && profile.type === 'financier') {
          const newAvailableFunds = (profile.availableFunds || profile.balance) - loanAmount;
          return { ...profile, availableFunds: newAvailableFunds };
        }
        return profile;
      })
    );

    // Update current profile if it's the trader
    if (currentProfile && currentProfile.id === traderId) {
      setCurrentProfile(prevProfile => ({
        ...prevProfile!,
        loans: {
          ...prevProfile!.loans,
          [financierId]: (prevProfile!.loans?.[financierId] || 0) + loanAmount
        }
      }));
    }
  };

  const addProfile = (profile: Profile) => {
    setProfiles(prev => [...prev, profile]);
  };

  const getProfileById = (id: string) => {
    return profiles.find(profile => profile.id === id);
  };

  const updateProfileInterests = (id: string, interests: Interest) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(profile =>
        profile.id === id ? { ...profile, interests } : profile
      )
    );
  };

  // ProfileContext.tsx

// No ProfileContext
const repayLoan = async (traderId: string, financierId: string, amount: number) => {
  const transactionId = `repay_${traderId}_${financierId}_${Date.now()}`;
  
  // Verifica se a transação já foi processada
  if (localStorage.getItem(transactionId)) {
    return;
  }

  // Marca a transação como em processamento
  localStorage.setItem(transactionId, 'processing');

  try {
    // Processa o reembolso
    setProfiles(prevProfiles =>
      prevProfiles.map(profile => {
        if (profile.id === traderId) {
          const newBalance = profile.balance - amount;
          const newLoans = { ...profile.loans };
          newLoans[financierId] = (newLoans[financierId] || 0) - amount;
          if (newLoans[financierId] <= 0) {
            delete newLoans[financierId];
          }
          return { ...profile, balance: newBalance, loans: newLoans };
        }
        if (profile.id === financierId) {
          return {
            ...profile,
            balance: profile.balance + amount,
            availableFunds: (profile.availableFunds || 0) + amount
          };
        }
        return profile;
      })
    );

    // Marca a transação como completa
    localStorage.setItem(transactionId, 'completed');
  } catch (error) {
    // Remove a marca em caso de erro
    localStorage.removeItem(transactionId);
    throw error;
  }

  // Remove a marca após um tempo
  setTimeout(() => {
    localStorage.removeItem(transactionId);
  }, 5000);
};

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
        repayLoan
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
};