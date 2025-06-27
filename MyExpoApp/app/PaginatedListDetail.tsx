import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function PaginatedListDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>详情页，ID: {id}</Text>
    </View>
  );
}