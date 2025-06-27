import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';

export default function HalfScreenModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [number, setNumber] = useState('');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1" onPress={onClose}>
        <View className="flex-1 justify-end">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <Pressable
              className="bg-white rounded-t-2xl p-6 h-[180]"
            //   style={{ minHeight: '10%' }}
              onPress={() => {}}
            >
              <Text className="text-lg font-bold mb-4">这是一个半屏弹窗</Text>
              <Text className="mb-2">请输入数字：</Text>
              <TextInput
                className="border border-gray-300 rounded px-3 py-2 mb-4"
                value={number}
                onChangeText={text => setNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                inputMode="numeric"
                placeholder="仅限数字"
                autoFocus
              />

            <TextInput
                className="border border-gray-300 rounded px-3 py-2 mb-0"
                value={number}
                onChangeText={text => setNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                inputMode="numeric"
                placeholder="仅限数字"
                autoFocus
              />
              {/* <TouchableOpacity
                className="mt-6 bg-blue-600 px-4 py-2 rounded"
                onPress={onClose}
              >
                <Text className="text-white text-center">关闭</Text>
              </TouchableOpacity> */}
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </Pressable>
    </Modal>
  );
}