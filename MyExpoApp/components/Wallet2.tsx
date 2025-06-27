// import { WalletConnectModal, useWalletConnectModal } from '@walletconnect/modal-react-native';
// import { useState } from 'react';
// import { Button, Text, View } from 'react-native';

// const PROJECT_ID = '你的walletconnect项目id';

// export default function OKXScreen() {
//   const { open, provider } = useWalletConnectModal();
//   const [account, setAccount] = useState<string | null>(null);

//   const handleConnect = async () => {
//     open();
//     // 监听连接事件，获取钱包地址
//     provider?.on('connect', (session) => {
//     //   const address = session.accounts?.[0];
//     //   setAccount(address || null);
//     });
//   };

//   return (
//       <View className="flex-1 bg-red-500 pt-20" >
//       <WalletConnectModal
//         projectId={PROJECT_ID}
//         providerMetadata={{
//           name: 'MyExpoApp',
//           description: 'WalletConnect Demo',
//           url: 'https://yourapp.com',
//           icons: ['https://yourapp.com/icon.png'],
//           redirect: {
//             native: 'myexpoapp://',
//             universal: 'https://yourapp.com',
//           },
//         }}
//       />
//       <Button title="连接WalletConnect" onPress={handleConnect} />
//       <Text>{account ? `已连接: ${account}` : "未连接钱包"}</Text>
//     </View>
//   );
// }