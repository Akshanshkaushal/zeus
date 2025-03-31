import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    settingText: {
        fontSize: 16
    },
    sectionHeader: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'transparent'
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: 'bold'
    }
});
