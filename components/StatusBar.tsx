import {SafeAreaView, StatusBar} from 'react-native';
import React from 'react';
import Colors from '@/constants/Colors';

const AppStatusBar = () => {
  return (
    <SafeAreaView style={{backgroundColor: Colors.dark.primary}}>
      <StatusBar
        translucent={false}
        backgroundColor={Colors.light.primary}
        barStyle={'light-content'}
      />
    </SafeAreaView>
  );
};

export default AppStatusBar;