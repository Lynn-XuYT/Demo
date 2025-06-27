import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { OKXUniversalProvider } from '@okxconnect/universal-provider';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text } from 'react-native';
import "../global.css";

export default function OKXScreen() {
    const providerRef = useRef<any>(null);
    const [account, setAccount] = useState<string | null>(null);
    useEffect(() => {
        async function initProvider() {
        try {
            const okxUniversalProvider = await OKXUniversalProvider.init({
            dappMetaData: {
                name: "MyExpoApp",
                icon: "https://images.pexels.com/photos/32695045/pexels-photo-32695045.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            },
            });
            providerRef.current = okxUniversalProvider;
        } catch (e) {
            console.error('OKX provider 初始化失败:', e);
        }
        }
        initProvider();
    }, []);

    // 连接钱包
    const handleConnect = async () => {
      
      if (!providerRef.current) return;
      try {
        const session = await providerRef.current.connect({
          namespaces: {
            solana: {
              chains: [
                "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", // solana mainnet
              ],
              methods: ["solana_signTransaction", "solana_signMessage"],
              events: [],
            }
          },
          sessionConfig: {
            redirect: "myexpoapp://"
          }
        });
        // 获取连接的钱包地址
        const address = session.namespaces.solana.accounts?.[0];
        setAccount(address || null);
      } catch (e) {
        // 处理用户拒绝或连接失败
        setAccount(null);
      }
    };
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
      <Button title="连接OKX钱包" onPress={handleConnect} />
      <Button title="断开连接" onPress={() => setAccount(null)} />
      <Text>{account ? `已连接: ${account}` : "未连接钱包"}</Text>
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
