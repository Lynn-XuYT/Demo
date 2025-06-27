import MyCustomButton from '@/components/MyCustomButton';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, Platform, Text, TouchableOpacity, View } from 'react-native';
type Item = {
  id: number;
  title: string;
};

const PAGE_SIZE = 20;

export default function PaginatedList() {
  const router = useRouter();
  const [data, setData] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      // 这里用 jsonplaceholder 作为示例接口
      const res = await axios.get<Item[]>(
        `https://jsonplaceholder.typicode.com/posts?_page=${pageNum}&_limit=${PAGE_SIZE}`
      );
      const newData = res.data;
      setHasMore(newData.length === PAGE_SIZE);
      setData(isRefresh ? newData : [...data, ...newData]);
      setPage(pageNum);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [data, loading]);

  useEffect(() => {
    fetchData(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchData(page + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(1, true);
  };

  const renderItem: ListRenderItem<Item> = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/PaginatedListDetail', params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
        <Text>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
  <View className="flex-1 bg-red-500 pt-20" >
    <MyCustomButton />
    <FlatList
      className="flex-1 bg-blue-500"
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.2}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      ListFooterComponent={loading && !refreshing ? <ActivityIndicator /> : null}
      contentContainerStyle={{
        paddingBottom: Platform.OS === 'ios' ? 100 : 60, // 根据平台调整底部空隙
      }}
    />
  </View>

  );
}