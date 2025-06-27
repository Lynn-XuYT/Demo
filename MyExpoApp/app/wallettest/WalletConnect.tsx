
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
// import { WalletConnectModal } from '@walletconnect/modal-react-native';
import ConfigUtils from '@/components/ConfigUtils';
import { Image } from 'expo-image';
import { Button, StyleSheet } from 'react-native';
import "../global.css";
// import { PROJECT_ID } from './walletconnectConfig'; // 你需要在 https://cloud.walletconnect.com 注册获取
import { useWalletConnectModal, WalletConnectModal } from '@walletconnect/modal-react-native';
export default function WalletConnectScreen() {
  const { open } = useWalletConnectModal();
  return (
  <ParallaxScrollView
    headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    headerImage={
      <Image
        source={require('@/assets/images/partial-react-logo.png')}
        style={styles.reactLogo}
      />
    }>
    <ThemedView style={styles.titleContainer}>
      <WalletConnectModal
        projectId={'36a4d9a6a95d656fa31288f75d8a0bc6'}
        providerMetadata={ConfigUtils.providerMetadata}
        sessionParams={ConfigUtils.sessionParams}
      />
        <Button title="连接walletconnect钱包" onPress={() => open()} />
    </ThemedView>
  </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
