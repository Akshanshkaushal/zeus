import backendUtils, { listPeers, disconnectPeer } from './BackendUtils';

jest.mock('react-native-randombytes', () => ({
    randomBytes: jest.fn((size, cb) => {
        const bytes = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
        cb && cb(null, bytes);
        return bytes;
    }),
    seed: jest.fn(() => Promise.resolve())
}));

jest.mock('../utils/LndMobileUtils', () => ({
    LndMobileEventEmitter: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn()
    },
    LndMobileToolsEventEmitter: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn()
    },
    lndMobile: {
        initialize: jest.fn(() => Promise.resolve()),
        startLnd: jest.fn(() => Promise.resolve()),
        stopLnd: jest.fn(() => Promise.resolve()),
        checkStatus: jest.fn(() => Promise.resolve()),
        sendCommand: jest.fn(() => Promise.resolve()),
        sendStreamCommand: jest.fn(() => Promise.resolve()),
        initWallet: jest.fn(() => Promise.resolve()),
        unlockWallet: jest.fn(() => Promise.resolve())
    }
}));

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');

    RN.NativeModules = {
        ...RN.NativeModules,
        SettingsManager: {
            settings: {},
            setSettings: jest.fn()
        },
        StatusBarManager: {
            HEIGHT: 42,
            setStyle: jest.fn(),
            setHidden: jest.fn(),
            setNetworkActivityIndicatorVisible: jest.fn()
        },
        DeviceInfo: {
            getConstants: () => ({
                Dimensions: {
                    window: {
                        width: 375,
                        height: 667,
                        scale: 2,
                        fontScale: 1
                    },
                    screen: {
                        width: 375,
                        height: 667,
                        scale: 2,
                        fontScale: 1
                    }
                },
                isIPhoneX_deprecated: false,
                reactNativeVersion: { major: 0, minor: 64, patch: 0 }
            })
        },
        PlatformConstants: {
            isTesting: true
        },
        Timing: {
            createTimer: jest.fn()
        },
        UIManager: {
            getViewManagerConfig: jest.fn(() => null)
        },
        LndMobile: {
            initialize: jest.fn(),
            startLnd: jest.fn(),
            stopLnd: jest.fn(),
            checkStatus: jest.fn(),
            sendCommand: jest.fn(),
            sendStreamCommand: jest.fn(),
            initWallet: jest.fn(),
            unlockWallet: jest.fn(),
            sendPayment: jest.fn()
        },
        RNRandomBytes: {
            seed: jest.fn((success) => success()),
            randomBytes: jest.fn((size, success) =>
                success(null, new Uint8Array(size))
            )
        }
    };

    RN.NativeEventEmitter = jest.fn(() => ({
        addListener: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn()
    }));

    return RN;
});

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
    getEnforcing: jest.fn((name) => {
        if (name === 'SettingsManager') {
            return {
                settings: {},
                setSettings: jest.fn()
            };
        }
        return {};
    })
}));

jest.mock('react-native/Libraries/Settings/Settings', () => ({
    get: jest.fn(() => null),
    set: jest.fn()
}));

jest.mock('react-native-tor', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        request: jest.fn(() => Promise.resolve({})),
        startIfNotStarted: jest.fn(() => Promise.resolve()),
        stop: jest.fn(() => Promise.resolve()),
        getNodes: jest.fn(() => Promise.resolve([]))
    })),
    RequestMethod: { GET: 'GET', POST: 'POST' }
}));

jest.mock('react-native-ping', () => ({ default: jest.fn() }));

jest.mock('react-native-device-info', () => ({
    getDeviceName: jest.fn(() => Promise.resolve('Mocked Device')),
    getUniqueId: jest.fn(() => 'mocked-unique-id'),
    getSystemName: jest.fn(() => 'Mocked System')
}));

jest.mock('react-native-securerandom', () => ({
    generateSecureRandom: jest.fn(() =>
        Promise.resolve(new Uint8Array([1, 2, 3, 4]))
    )
}));

jest.mock('react-native-blob-util', () => ({
    fs: { dirs: { DocumentDir: '/mocked/document/dir' } },
    config: jest.fn(),
    fetch: jest.fn(),
    session: jest.fn(),
    android: { addCompleteDownload: jest.fn() }
}));

jest.mock('react-native-encrypted-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve())
}));

jest.mock('react-native-notifications', () => ({
    Notifications: {
        registerRemoteNotifications: jest.fn(),
        postLocalNotification: jest.fn(),
        events: jest.fn(() => ({
            registerNotificationReceivedForeground: jest.fn(),
            registerNotificationOpened: jest.fn()
        }))
    }
}));

jest.mock('./BackendUtils', () => {
    const originalModule = jest.requireActual('./BackendUtils');
    return {
        ...originalModule,
        backendUtils: {
            getClass: jest.fn()
        }
    };
});

describe('BackendUtils', () => {
    let mockBackend: any;

    beforeEach(() => {
        // Mock the backend class
        mockBackend = {
            listPeers: jest.fn(),
            disconnectPeer: jest.fn()
        };

        // Mock the getClass method to return the mocked backend
        (backendUtils.getClass as jest.Mock).mockReturnValue(mockBackend);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listPeers', () => {
        it('should return a list of peers when the backend supports listPeers', async () => {
            const mockPeers = [
                {
                    pub_key:
                        '03e84a109cd70e57864274932fc87c5e6434c59ebb8e6e7d28532219ba38f7f6df',
                    address: '139.144.22.237:9735',
                    bytes_recv: '337874',
                    bytes_sent: '1708',
                    inbound: false,
                    ping_time: '-1',
                    sat_recv: '0',
                    sat_sent: '0',
                    sync_type: '1'
                }
            ];
            mockBackend.listPeers.mockResolvedValue(mockPeers);

            const result = await listPeers();
            expect(mockBackend.listPeers).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockPeers);
        });

        it('should return an empty list if the backend does not support listPeers', async () => {
            mockBackend.listPeers = undefined;

            const result = await listPeers();
            expect(result).toEqual({ peers: [] });
        });

        it('should handle errors gracefully when listPeers throws an error', async () => {
            mockBackend.listPeers.mockRejectedValue(new Error('Backend error'));

            await expect(listPeers()).rejects.toThrow('Backend error');
            expect(mockBackend.listPeers).toHaveBeenCalledTimes(1);
        });
    });

    describe('disconnectPeer', () => {
        it('should disconnect a peer when the backend supports disconnectPeer', async () => {
            const pubKey =
                '03e84a109cd70e57864274932fc87c5e6434c59ebb8e6e7d28532219ba38f7f6df';
            mockBackend.disconnectPeer.mockResolvedValue(true);

            const result = await disconnectPeer(pubKey);
            expect(mockBackend.disconnectPeer).toHaveBeenCalledTimes(1);
            expect(mockBackend.disconnectPeer).toHaveBeenCalledWith(pubKey);
            expect(result).toBe(true);
        });

        it('should return false if the backend does not support disconnectPeer', async () => {
            mockBackend.disconnectPeer = undefined;

            const pubKey =
                '03e84a109cd70e57864274932fc87c5e6434c59ebb8e6e7d28532219ba38f7f6df';
            const result = await disconnectPeer(pubKey);
            expect(result).toBe(false);
        });

        it('should handle errors gracefully when disconnectPeer throws an error', async () => {
            const pubKey =
                '03e84a109cd70e57864274932fc87c5e6434c59ebb8e6e7d28532219ba38f7f6df';
            mockBackend.disconnectPeer.mockRejectedValue(
                new Error('Backend error')
            );

            await expect(disconnectPeer(pubKey)).rejects.toThrow(
                'Backend error'
            );
            expect(mockBackend.disconnectPeer).toHaveBeenCalledTimes(1);
        });
    });
});
