import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type HeaderProps = {
  header: string;
  navigation: any;
};

const Header = ({ navigation, header }: HeaderProps) => {
  return (
    <View style={styles.headerWrapStyle}>
      <ArrowLeft
        size={22}
        color={Colors.light.subtext}
        onPress={() => navigation.pop()}
      />
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          marginLeft: Layout.spacing.m,
        }}
      >
        {header}
      </Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerWrapStyle: {
    backgroundColor: Colors.light.accentLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.l,
    paddingVertical: Layout.spacing.s,
    zIndex: 100,
  },
});
