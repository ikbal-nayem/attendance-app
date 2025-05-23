import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { commonStyles } from '@/utils/styles';
import { FilterIcon, X } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Button from './Button';

export const FilterDrawerHeader = ({ children, onClose }: { children?: string; onClose: any }) => (
  <View style={[commonStyles.flexRowAlignCenter, styles.filterDrawerHeader]}>
    <Text style={styles.drawerTitle}>{children || 'Filter'}</Text>
    <X size={20} color={Colors.light.text} onPress={onClose} />
  </View>
);

export const FilterDrawerFooter = ({
  clearFilters,
  onFilterSubmit,
}: {
  clearFilters: any;
  onFilterSubmit: any;
}) => (
  <View style={[commonStyles.flexRowAlignCenter, styles.filterButtonGroup]}>
    <Button size="small" title="Clear Filters" onPress={clearFilters} variant="outline" />
    <Button
      size="small"
      title="Apply Filters"
      onPress={onFilterSubmit}
      icon={<FilterIcon color={Colors.light.background} size={14} />}
      iconPosition="right"
    />
  </View>
);

const styles = StyleSheet.create({
  filterDrawerHeader: {
    justifyContent: 'space-between',
    marginVertical: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingBottom: Layout.spacing.m,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
  },
  filterButtonGroup: {
    justifyContent: 'space-between',
    marginTop: Layout.spacing.l,
  },
});
