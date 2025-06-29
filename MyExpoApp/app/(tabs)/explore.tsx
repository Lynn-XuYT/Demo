import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import { Buffer } from "buffer";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Platform, ScrollView, Text, View } from "react-native";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import nacl from "tweetnacl";

global.Buffer = global.Buffer || Buffer;

const NETWORK = 'https://solana-mainnet.g.alchemy.com/v2/jpk_VaeLiOPozP2lmX1iKzZ9uCzMXsjg';//clusterApiUrl("devnet");

const onConnectRedirectLink = Linking.createURL("explore?event=onConnect");
const onDisconnectRedirectLink = Linking.createURL("explore?event=onDisconnect");
const onSignAndSendTransactionRedirectLink = Linking.createURL("explore?event=onSignAndSendTransaction");
const onSignAllTransactionsRedirectLink = Linking.createURL("explore?event=onSignAllTransactions");
const onSignTransactionRedirectLink = Linking.createURL("explore?event=onSignTransaction");
const onSignMessageRedirectLink = Linking.createURL("explore?event=onSignMessage");

/**
 * If true, uses universal links instead of deep links. This is the recommended way for dapps
 * and Phantom to handle deeplinks as we own the phantom.app domain.
 *
 * Set this to false to use normal deeplinks, starting with phantom://. This is easier for
 * debugging with a local build such as Expo Dev Client builds.
 */
const useUniversalLinks = false;
const buildUrl = (path: string, params: URLSearchParams) =>
  `${useUniversalLinks ? "https://phantom.app/ul/" : "phantom://"}v1/${path}?${params.toString()}`;

const decryptPayload = (data: string, nonce: string, sharedSecret?: Uint8Array) => {
  if (!sharedSecret) throw new Error("missing shared secret");

  const decryptedData = nacl.box.open.after(bs58.decode(data), bs58.decode(nonce), sharedSecret);
  if (!decryptedData) {
    throw new Error("Unable to decrypt data");
  }
  return JSON.parse(Buffer.from(decryptedData).toString("utf8"));
};

const encryptPayload = (payload: any, sharedSecret?: Uint8Array) => {
  if (!sharedSecret) throw new Error("missing shared secret");

  const nonce = nacl.randomBytes(24);

  const encryptedPayload = nacl.box.after(
    Buffer.from(JSON.stringify(payload)),
    nonce,
    sharedSecret
  );

  return [nonce, encryptedPayload];
};

export default function App() {
  const [deepLink, setDeepLink] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const connection = new Connection(NETWORK);
  const addLog = useCallback((log: string) => setLogs((logs) => [...logs, "> " + log]), []);
  const clearLog = useCallback(() => setLogs(() => []), []);
  const scrollViewRef = useRef<any>(null);

  // store dappKeyPair, sharedSecret, session and account SECURELY on device
  // to avoid having to reconnect users.
  const [dappKeyPair] = useState(nacl.box.keyPair());
  const [sharedSecret, setSharedSecret] = useState<Uint8Array>();
  const [session, setSession] = useState<string>();
  const [phantomWalletPublicKey, setPhantomWalletPublicKey] = useState<PublicKey>();

  useEffect(() => {
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        setDeepLink(initialUrl);
      }
    })();
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = ({ url }: Linking.EventType) => {
    setDeepLink(url);
  };

  // handle inbounds links
  useEffect(() => {
    if (!deepLink) return;

    const url = new URL(deepLink);
    const params = url.searchParams;
    const event = params.get("event");

    if (params.get("errorCode")) {
      addLog(JSON.stringify(Object.fromEntries([...params]), null, 2));
      return;
    }

    if (event === "onConnect") {
      const sharedSecretDapp = nacl.box.before(
        bs58.decode(params.get("phantom_encryption_public_key")!),
        dappKeyPair.secretKey
      );

      const connectData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecretDapp
      );

      setSharedSecret(sharedSecretDapp);
      setSession(connectData.session);
      setPhantomWalletPublicKey(new PublicKey(connectData.public_key));

      addLog(JSON.stringify(connectData, null, 2));
    } else if (event === "onDisconnect") {
      addLog("Disconnected!");
    } else if (event === "onSignAndSendTransaction" ) {
      const signAndSendTransactionData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecret
      );

      addLog(JSON.stringify(signAndSendTransactionData, null, 2));
    } else if (event === "onSignAllTransactions") {
      const signAllTransactionsData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecret
      );

      const decodedTransactions = signAllTransactionsData.transactions.map((t: string) =>
        Transaction.from(bs58.decode(t))
      );

      addLog(JSON.stringify(decodedTransactions, null, 2));
    } else if (event === "onSignTransaction") {
      const signTransactionData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecret
      );

      const decodedTransaction = Transaction.from(bs58.decode(signTransactionData.transaction));

      addLog(JSON.stringify(decodedTransaction, null, 2));
    } else if (event === "onSignMessage") {
      const signMessageData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecret
      );

      addLog(JSON.stringify(signMessageData, null, 2));
    }
  }, [deepLink]);

  const createTransferTransaction = async () => {
    if (!phantomWalletPublicKey) throw new Error("missing public key from user");
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: phantomWalletPublicKey,
        toPubkey: phantomWalletPublicKey,
        lamports: 100
      })
    );
    transaction.feePayer = phantomWalletPublicKey;
    addLog("Getting recent blockhash");
    const anyTransaction: any = transaction;
    anyTransaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    addLog("transaction getRecentBlockhash: " + anyTransaction.recentBlockhash);
    return transaction;
  };

  const connect = async () => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: "devnet",
      app_url: "https://phantom.app",
      redirect_link: onConnectRedirectLink
    });

    const url = buildUrl("connect", params);
    Linking.openURL(url);
  };

  const disconnect = async () => {
    const payload = {
      session
    };
    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onDisconnectRedirectLink,
      payload: bs58.encode(encryptedPayload)
    });

    const url = buildUrl("disconnect", params);
    Linking.openURL(url);
  };

  const signAndSendTransaction = async () => {
    console.log("signAndSendTransaction...");
    const transaction = await createTransferTransaction();

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false
    });

    const payload = {
      session,
      transaction: bs58.encode(serializedTransaction)
    };
    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignAndSendTransactionRedirectLink,
      payload: bs58.encode(encryptedPayload)
    });
    console.log("Sending transaction...");
    addLog("Sending transaction...");
    const url = buildUrl("signAndSendTransaction", params);
    Linking.openURL(url);
  };

  const signAllTransactions = async () => {
    const transactions = await Promise.all([
      createTransferTransaction(),
      createTransferTransaction()
    ]);

    const serializedTransactions = transactions.map((t) =>
      bs58.encode(
        t.serialize({
          requireAllSignatures: false
        })
      )
    );

    const payload = {
      session,
      transactions: serializedTransactions
    };

    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignAllTransactionsRedirectLink,
      payload: bs58.encode(encryptedPayload)
    });

    addLog("Signing transactions...");
    const url = buildUrl("signAllTransactions", params);
    Linking.openURL(url);
  };

  const signTransaction = async () => {
    console.log("signTransaction...");
    const transaction = await createTransferTransaction();

    const serializedTransaction = bs58.encode(
      transaction.serialize({
        requireAllSignatures: false
      })
    );

    const payload = {
      session,
      transaction: serializedTransaction
    };

    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignTransactionRedirectLink,
      payload: bs58.encode(encryptedPayload)
    });

    console.log("Signing transaction...");
    addLog("Signing transaction...");
    const url = buildUrl("signTransaction", params);
    Linking.openURL(url);
  };

  const signMessage = async () => {
    const message = "To avoid digital dognappers, sign below to authenticate with CryptoCorgis.";

    const payload = {
      session,
      message: bs58.encode(Buffer.from(message))
    };

    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignMessageRedirectLink,
      payload: bs58.encode(encryptedPayload)
    });

    addLog("Signing message...");
    const url = buildUrl("signMessage", params);
    Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#333" }}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            backgroundColor: "#111",
            padding: 20,
            paddingTop: 100,
            flexGrow: 1
          }}
          ref={scrollViewRef}
          onContentSizeChange={() => {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }}
          style={{ flex: 1 }}
        >
          {logs.map((log, i) => (
            <Text
              key={`t-${i}`}
              style={{
                fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
                color: "#fff",
                fontSize: 14
              }}
            >
              {log}
            </Text>
          ))}
        </ScrollView>
      </View>
      <View style={{ flex: 0, paddingTop: 20, paddingBottom: 40 }}>
        <Btn title="Connect" onPress={connect} />
        <Btn title="Disconnect" onPress={disconnect} />
        <Btn title="Sign And Send Transaction" onPress={signAndSendTransaction} />
        <Btn title="Sign All Transactions" onPress={signAllTransactions} />
        <Btn title="Sign Transaction" onPress={signTransaction} />
        <Btn title="Sign Message" onPress={signMessage} />
        <Btn title="Clear Logs" onPress={clearLog} />
      </View>
    </View>
  );
}

const Btn = ({ title, onPress }: { title: string; onPress: () => void | Promise<void> }) => {
  return (
    <View style={{ marginVertical: 10 }}>
      <Button title={title} onPress={onPress} />
    </View>
  );
};
