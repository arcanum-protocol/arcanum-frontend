import { FarmsStore } from '@/store/FarmsStore';
import { MultipoolStore } from '@/store/MultipoolStore';
import { createContext, useContext } from 'react';

interface StoreProviderState {
    store?: MultipoolStore | FarmsStore;
    setStore: (store: MultipoolStore | FarmsStore) => void;
}

interface StoreProviderProps {
    children: React.ReactNode;
    store: MultipoolStore | FarmsStore;
}

const initialState: StoreProviderState = {
    store: undefined,
    setStore: () => null,
};

const StoreProviderContext = createContext(initialState);

export function StoreProvider({ children, store, ...props }: StoreProviderProps) {
    const value = {
        store,
        setStore: (store: MultipoolStore | FarmsStore) => {
            store = store;
        },
    };

    return (
        <StoreProviderContext.Provider {...props} value={value}>
            {children}
        </StoreProviderContext.Provider>
    );
}

// export function useMultipoolStore() {
//     const context = useContext(StoreProviderContext);
//     if (context === undefined) {
//         throw new Error('useMultipoolStore must be used within a StoreProvider');
//     }
//     return context.store!;
// }

export function useMultipoolStore() {
    const context = useContext(StoreProviderContext);
    if (context === undefined) {
        throw new Error('useMultipoolStore must be used within a StoreProvider');
    }
    return context.store as MultipoolStore;
}

export function useFarmsStore() {
    const context = useContext(StoreProviderContext);
    if (context === undefined) {
        throw new Error('useMultipoolStore must be used within a StoreProvider');
    }
    return context.store as FarmsStore;
}
