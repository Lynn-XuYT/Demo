import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Dimensions, Share, Text, TouchableOpacity, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import HalfScreenModal from './HalfScreenModal';

export default function MyCustomButton() {
  const [visible, setVisible] = useState(false);
  const screenWidth = Dimensions.get('window').width;
    // 分享处理函数
  const handleShare = async () => {
    try {
      await Share.share({
        message: '这是分享内容，可以自定义。',
      });
    } catch (error) {
      // 可选：处理错误
    }
  };

    const viewRef = useRef<View>(null);
  const [showShareView, setShowShareView] = useState(false);
  // 分享 View 截图
  const handleShareView = async () => {
    setShowShareView(true); // 先渲染隐藏View
    setTimeout(async () => {
      try {
        const uri = await captureRef(viewRef, {
          format: 'png',
          quality: 1,
        });
        await Sharing.shareAsync(uri);
      } catch (error) {
        // 可选：处理错误
      } finally {
        setShowShareView(false); // 截图后立即隐藏
      }
    }, 100); // 等待渲染
  };

  return (
    <View className="items-start ml-4 mt-4 mb-4">
            {/* <View
        ref={viewRef}
        className="w-[200] h-[100] bg-yellow-300 items-center justify-center mb-4"
        collapsable={false} // 必须加，安卓下截图才有效
      >
        <Text className="text-black">要分享的内容</Text>
      </View> */}

      <TouchableOpacity
        className="bg-blue-600 px-6 py-3 rounded-lg"
        activeOpacity={0.7}
        onPress={() => setVisible(true)}
      >
        <Text className="text-white font-bold">NativeWind 按钮</Text>
      </TouchableOpacity>

      <HalfScreenModal visible={visible} onClose={() => setVisible(false)} />

      <TouchableOpacity
        className="mt-4 bg-green-600 px-6 py-3 rounded-lg"
        activeOpacity={0.7}
        onPress={handleShare}
      >
        <Text className="text-white font-bold">分享</Text>
      </TouchableOpacity>

            <TouchableOpacity
        className="mt-2 bg-green-600 px-6 py-3 rounded-lg"
        activeOpacity={0.7}
        onPress={handleShareView}
      >
        <Text className="text-white font-bold">分享上方View为图片</Text>
      </TouchableOpacity>

            {showShareView && (
        <View
          ref={viewRef}
          style={{
            position: 'absolute',
            left: -9999, // 屏幕外
            width: screenWidth,
            height: 100,
            backgroundColor: '#fde047',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          collapsable={false}
        >
          <Text style={{ color: '#000' }}>要分享的内容</Text>
        </View>
      )}
    </View>
    
  );
}