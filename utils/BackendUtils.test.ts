import backendUtils, { disconnectPeer } from './BackendUtils';

// Mock all backend implementations
jest.mock('../backends/LND', () => jest.fn().mockImplementation(() => ({})));
jest.mock('../backends/LightningNodeConnect', () => jest.fn().mockImplementation(() => ({})));
jest.mock('../backends/EmbeddedLND', () => jest.fn().mockImplementation(() => ({})));
jest.mock('../backends/CLNRest', () => jest.fn().mockImplementation(() => ({})));
jest.mock('../backends/LndHub', () => jest.fn().mockImplementation(() => ({})));
jest.mock('../backends/NostrWalletConnect', () => jest.fn().mockImplementation(() => ({})));

jest.mock('../stores/storeInstances', () => ({
    settingsStore: {
        implementation: 'lnd'
    }
}));

describe('BackendUtils', () => {
   
    const originalConsoleLog = console.log;
    
    beforeEach(() => {
         console.log = jest.fn();
        jest.clearAllMocks();
    });
    
    afterAll(() => {
         console.log = originalConsoleLog;
    });
    
    describe('disconnectPeer', () => {
        it('returns true when disconnection is successful', async () => {
 
            const mockDisconnectPeer = jest.fn().mockResolvedValue(true);
            backendUtils.getClass = jest.fn().mockReturnValue({
                disconnectPeer: mockDisconnectPeer
            });
            
            const result = await disconnectPeer('test-pubkey');
            
            expect(result).toBe(true);
            expect(mockDisconnectPeer).toHaveBeenCalledWith('test-pubkey');
        });
        
        it('returns false when backend does not support disconnectPeer', async () => {
 
            backendUtils.getClass = jest.fn().mockReturnValue({
 
            });
            
            const result = await disconnectPeer('test-pubkey');
            
            expect(result).toBe(false);
            expect(console.log).toHaveBeenCalledWith(
                'Backend does not support disconnectPeer'
            );
        });
        
        it('returns false when backend is null or undefined', async () => {
 
            backendUtils.getClass = jest.fn().mockReturnValue(null);
            
            const result = await disconnectPeer('test-pubkey');
            
            expect(result).toBe(false);
            expect(console.log).toHaveBeenCalledWith(
                'Backend does not support disconnectPeer'
            );
        });
        
        it('returns false and logs when disconnectPeer throws an error', async () => {
            // Mock backend with disconnectPeer that throws
            const testError = new Error('Test disconnect error');
            const mockDisconnectPeer = jest.fn().mockRejectedValue(testError);
            backendUtils.getClass = jest.fn().mockReturnValue({
                disconnectPeer: mockDisconnectPeer
            });
            
            const result = await disconnectPeer('test-pubkey');
            
            expect(result).toBe(false);
            expect(console.log).toHaveBeenCalledWith(
                'Error disconnecting peer:',
                testError
            );
        });
        
        it('returns false when backend disconnectPeer returns false', async () => {
            // Mock backend with disconnectPeer that returns false
            const mockDisconnectPeer = jest.fn().mockResolvedValue(false);
            backendUtils.getClass = jest.fn().mockReturnValue({
                disconnectPeer: mockDisconnectPeer
            });
            
            const result = await disconnectPeer('test-pubkey');
            
            expect(result).toBe(false);
        });
    });
});