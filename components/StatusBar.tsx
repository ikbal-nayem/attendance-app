import Colors from '@/constants/Colors';
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';

const AppStatusBar = ({ bgColor }: { bgColor?: 'primary' | 'default' }) => {
  return (
    <SafeAreaView
      style={{
        backgroundColor: bgColor === 'default' ? Colors.light.inputBackground : Colors.light.primary,
      }}
    >
      <StatusBar
        translucent={false}
        backgroundColor={bgColor === 'default' ? Colors.light.inputBackground : Colors.light.primary}
        barStyle={bgColor === 'default'? 'dark-content' : 'light-content'}
      />
    </SafeAreaView>
  );
};

export default AppStatusBar;
