import { MultipoolStore } from '@/store/MultipoolStore';
import { createContext, useContext } from 'react';

interface StoreProviderState {
    store?: MultipoolStore;
    setStore: (store: MultipoolStore) => void;
}

interface StoreProviderProps {
    children: React.ReactNode;
    store: MultipoolStore;
}

const initialState: StoreProviderState = {
    store: undefined,
    setStore: () => null,
};

const StoreProviderContext = createContext(initialState);

export function StoreProvider({ children, store, ...props }: StoreProviderProps) {
    const value = {
        store,
        setStore: (store: MultipoolStore) => {
            store = store;
        },
    };

    return (
        <StoreProviderContext.Provider {...props} value={value}>
            {children}
        </StoreProviderContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreProviderContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context.store!;
}
