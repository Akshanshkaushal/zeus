import stores from './Stores';
import { PeersStore as PeersStoreClass } from './PeersStore';

export const fiatStore = stores.fiatStore;
export const notesStore = stores.notesStore;
export const settingsStore = stores.settingsStore;
export const nodeInfoStore = stores.nodeInfoStore;
export const PeersStore = new PeersStoreClass();

export default {
    fiatStore,
    notesStore,
    settingsStore,
    nodeInfoStore,
    PeersStore 
};
 
