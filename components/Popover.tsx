import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';

type PopoverProps = {
  children: React.ReactNode;
  content: React.ReactNode;
};

const Popover = ({ children, content }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
        {children}
      </TouchableOpacity>

      {isOpen && (
        <View
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 16,
            minWidth: 200,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 100,
          }}
        >
          {content}
        </View>
      )}
    </View>
  );
};

export default Popover;