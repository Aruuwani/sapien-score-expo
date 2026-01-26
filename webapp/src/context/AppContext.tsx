import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface Person {
  id?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  work_email?: string;
}

interface AppContextType {
  selectedPerson: Person | null;
  setSelectedPerson: (person: Person | null) => void;
  selectedRelation: string | null;
  setSelectedRelation: (relation: string | null) => void;
  scoringData: any;
  setScoringData: (data: any) => void;
  receiverID: string | null;
  setReceiverID: (id: string | null) => void;
  scoredRelationIds: string[];
  setScoredRelationIds: (ids: string[]) => void;
  updatedRatingId: string | null;
  setUpdatedRatingId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedRelation, setSelectedRelation] = useState<string | null>(null);
  const [scoringData, setScoringData] = useState<any>(null);
  const [receiverID, setReceiverID] = useState<string | null>(null);
  const [scoredRelationIds, setScoredRelationIds] = useState<string[]>([]);
  const [updatedRatingId, setUpdatedRatingId] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        selectedPerson,
        setSelectedPerson,
        selectedRelation,
        setSelectedRelation,
        scoringData,
        setScoringData,
        receiverID,
        setReceiverID,
        scoredRelationIds,
        setScoredRelationIds,
        updatedRatingId,
        setUpdatedRatingId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Alias for convenience
export const useApp = useAppContext;

