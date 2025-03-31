import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Icon } from 'react-native-elements';
import { inject, observer } from 'mobx-react';
import { themeColor } from '../../utils/ThemeUtils';
import { localeString } from '../../utils/LocaleUtils';
import Screen from '../../components/Screen';
import Header from '../../components/Header';

// Define the props that will be injected by MobX
interface InjectedProps {
    PeersStore: any;
    SettingsStore: any;
    navigation: any;
}

// The component doesn't require any props from outside
@inject('SettingsStore', 'PeersStore')
@observer
class PeersView extends React.Component {
    // This getter helps TypeScript understand the injected props
    get injected() {
        return this.props as InjectedProps;
    }

    componentDidMount() {
        const { PeersStore } = this.injected;
        PeersStore.fetchPeers();
    }

    handleDisconnect = (pubKey: string) => {
        const { PeersStore } = this.injected;

        Alert.alert(
            localeString('views.Peers.disconnectTitle'),
            localeString('views.Peers.disconnectConfirm'),
            [
                {
                    text: localeString('general.cancel'),
                    style: 'cancel'
                },
                {
                    text: localeString('general.confirm'),
                    onPress: async () => {
                        const success = await PeersStore.disconnectPeer(pubKey);
                        if (!success) {
                            Alert.alert(
                                localeString('general.error'),
                                PeersStore.error ||
                                    localeString('views.Peers.disconnectError')
                            );
                        }
                    }
                }
            ]
        );
    };

    renderPeerItem = ({ item }: { item: any }) => {
        return (
            <View
                style={[
                    styles.peerItem,
                    { backgroundColor: themeColor('secondary') }
                ]}
            >
                <View style={styles.peerInfo}>
                    <Text
                        style={[styles.pubKey, { color: themeColor('text') }]}
                    >
                        {item.pub_key}
                    </Text>
                    <Text
                        style={[
                            styles.address,
                            { color: themeColor('secondaryText') }
                        ]}
                    >
                        {item.address}
                    </Text>
                    <View style={styles.statsRow}>
                        <Text
                            style={[
                                styles.statText,
                                { color: themeColor('secondaryText') }
                            ]}
                        >
                            {localeString('views.Peers.pingTime')}:{' '}
                            {item.ping_time}ms
                        </Text>
                        <Text
                            style={[
                                styles.statText,
                                { color: themeColor('secondaryText') }
                            ]}
                        >
                            {localeString('views.Peers.satsSent')}:{' '}
                            {item.sat_sent}
                        </Text>
                        <Text
                            style={[
                                styles.statText,
                                { color: themeColor('secondaryText') }
                            ]}
                        >
                            {localeString('views.Peers.satsReceived')}:{' '}
                            {item.sat_recv}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={() => this.handleDisconnect(item.pub_key)}
                >
                    <Icon
                        name="disconnect"
                        type="material-community"
                        size={24}
                        color={themeColor('error')}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    refreshPeers = () => {
        const { PeersStore } = this.injected;
        PeersStore.fetchPeers();
    };

    render() {
        const { PeersStore, navigation } = this.injected;
        const { peers, loading, error } = PeersStore;

        if (loading && peers.length === 0) {
            return (
                <Screen>
                    <Header
                        leftComponent={{
                            icon: 'arrow-back',
                            onPress: () => navigation.goBack()
                        }}
                        centerComponent={{
                            text: localeString('views.Peers.title'),
                            style: { color: themeColor('text') }
                        }}
                    />
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={themeColor('highlight')}
                        />
                    </View>
                </Screen>
            );
        }

        return (
            <Screen>
                <Header
                    leftComponent={{
                        icon: 'arrow-back',
                        onPress: () => navigation.goBack()
                    }}
                    centerComponent={{
                        text: localeString('views.Peers.title'),
                        style: { color: themeColor('text') }
                    }}
                />
                {peers.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text
                            style={[
                                styles.emptyText,
                                { color: themeColor('secondaryText') }
                            ]}
                        >
                            {error
                                ? localeString('views.Peers.errorLoading')
                                : localeString('views.Peers.noPeers')}
                        </Text>
                        {error && (
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={this.refreshPeers}
                            >
                                <Text
                                    style={[
                                        styles.retryText,
                                        { color: themeColor('highlight') }
                                    ]}
                                >
                                    {localeString('general.retry')}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <FlatList
                        data={peers}
                        renderItem={this.renderPeerItem}
                        keyExtractor={(item) => item.pub_key}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={this.refreshPeers}
                                tintColor={themeColor('highlight')}
                            />
                        }
                    />
                )}
            </Screen>
        );
    }
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listContainer: {
        padding: 16,
        flexGrow: 1
    },
    peerItem: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        elevation: 2,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2
    },
    peerInfo: {
        flex: 1
    },
    pubKey: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4
    },
    address: {
        fontSize: 14,
        marginBottom: 8
    },
    statsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    statText: {
        fontSize: 12,
        marginRight: 12,
        marginBottom: 4
    },
    disconnectButton: {
        justifyContent: 'center',
        paddingLeft: 16
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16
    },
    retryButton: {
        padding: 12
    },
    retryText: {
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default PeersView;
