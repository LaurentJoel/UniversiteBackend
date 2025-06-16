import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';

interface DropdownItem {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  items: DropdownItem[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  style?: any;
}

export default function CustomDropdown({ 
  items, 
  selectedValue, 
  onValueChange, 
  placeholder = "Sélectionner une option",
  style 
}: CustomDropdownProps): React.ReactElement {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const selectedItem = items.find(item => item.value === selectedValue);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsVisible(false);
  };

  const renderItem = ({ item }: { item: DropdownItem }) => (
    <TouchableOpacity
      style={[
        styles.item,
        { 
          backgroundColor: item.value === selectedValue ? theme.colors.primary : theme.colors.background,
          borderBottomColor: theme.colors.border 
        }
      ]}
      onPress={() => handleSelect(item.value)}
    >
      <Text style={[
        styles.itemText,
        { 
          color: item.value === selectedValue ? '#FFFFFF' : theme.colors.text,
          fontWeight: item.value === selectedValue ? 'bold' : 'normal'
        }
      ]}>
        {item.label}
      </Text>
      {item.value === selectedValue && (
        <Icon name="check" size={20} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.selector,
          { 
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background 
          }
        ]}
        onPress={() => setIsVisible(true)}
      >
        <Text style={[
          styles.selectorText,
          { 
            color: selectedItem ? theme.colors.text : theme.colors.border,
            fontWeight: selectedItem ? 'normal' : '400'
          }
        ]}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Icon 
          name={isVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
          size={24} 
          color={theme.colors.text} 
        />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={[
            styles.dropdown,
            { 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border 
            }
          ]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.headerText, { color: theme.colors.text }]}>
                {placeholder}
              </Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={renderItem}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 50,
  },
  selectorText: {
    fontSize: 16,
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdown: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 12,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  list: {
    maxHeight: 300,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16,
    flex: 1,
  },
});
