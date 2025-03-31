import { observable, action, runInAction } from 'mobx';
import BackendUtils from '../utils/BackendUtils';

export interface Peer {
  pub_key: string;
  address: string;
  bytes_sent: string;
  bytes_recv: string;
  sat_sent: string;
  sat_recv: string;
  inbound: boolean;
  ping_time: string;
  sync_type: string;
}

export class PeersStore {
  @observable peers: Peer[] = [];
  @observable loading: boolean = false;
  @observable error: string | null = null;

  constructor() {
    // No need for makeObservable in older MobX versions
    // The @observable and @action decorators handle this
  }

  @action
  async fetchPeers() {
    this.loading = true;
    this.error = null;
    
    try {
      const peers = await BackendUtils.listPeers();
      runInAction(() => {
        this.peers = peers;
        this.loading = false;
      });
    } catch (error: unknown) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch peers';
        this.loading = false;
      });
    }
  }

  @action
  async disconnectPeer(pubkey: string) {
    this.loading = true;
    this.error = null;
    
    try {
      const success = await BackendUtils.disconnectPeer(pubkey);
      if (success) {
        // Remove the peer from the list if disconnection was successful
        runInAction(() => {
          this.peers = this.peers.filter(peer => peer.pub_key !== pubkey);
          this.loading = false;
        });
        return true;
      } else {
        throw new Error('Failed to disconnect peer');
      }
    } catch (error: unknown) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to disconnect peer';
        this.loading = false;
      });
      return false;
    }
  }
}

export default new PeersStore(); 