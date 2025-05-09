// New Fancy Color Scheme

const tintColorLight = '#007AFF'; // Vibrant Blue
const tintColorDark = '#0A84FF'; // Lighter Blue for Dark Mode

export default {
  light: {
    primary: '#0096c7', // Vibrant Blue
    primaryLight: '#caf0f8', // Lighter shade for hover/active states if needed
    primaryDark: '#023e8a', // Darker shade if needed
    secondary: '#d264b6', // Orange
    secondaryLight: '#a480cf',
    secondaryDark: '#ff499e',
    accent: '#34C759', // Green
    accentLight: '#6EE089',
    accentDark: '#248A3D',
    success: '#34C759', // Green
    warning: '#FFCC00', // Yellow
    error: '#FF3B30', // Red
    info: '#007AFF', // Vibrant Blue (Using primary for info)
    text: '#1C1C1E', // Almost Black
    subtext: '#8A8A8E', // Medium Grey
    textSecondary: '#8A8A8E', // Using subtext for secondary text
    background: '#F2F2F7', // Very Light Grey (iOS style)
    card: '#FFFFFF', // White
    border: '#D1D1D6', // Light Grey
    tint: tintColorLight,
    tabIconDefault: '#8A8A8E', // Medium Grey
    tabIconSelected: tintColorLight,
    inputBackground: '#FFFFFF', // White
    inputBorder: '#C7C7CC', // Slightly darker grey for input borders
    inputFocusBorder: tintColorLight, // Use primary color for focus
    statusBar: 'dark', // Dark text/icons on light background
  },
  dark: {
    primary: '#04696d', // Lighter Blue for Dark Mode
    primaryLight: '#C4E6E7',
    primaryDark: '#035156',
    secondary: '#FF9F0A', // Lighter Orange
    secondaryLight: '#FFBC57',
    secondaryDark: '#D18000',
    accent: '#30D158', // Lighter Green
    accentLight: '#66EAAA',
    accentDark: '#219640',
    success: '#30D158', // Lighter Green
    warning: '#FFD60A', // Lighter Yellow
    error: '#FF453A', // Lighter Red
    info: '#0A84FF', // Lighter Blue for Dark Mode (Using primary for info)
    text: '#FFFFFF', // White
    subtext: '#8D8D93', // Lighter Grey
    textSecondary: '#8D8D93', // Using subtext for secondary text
    background: '#000000', // Black (iOS style)
    card: '#1C1C1E', // Almost Black
    border: '#3A3A3C', // Dark Grey
    tint: tintColorDark,
    tabIconDefault: '#8D8D93', // Lighter Grey
    tabIconSelected: tintColorDark,
    inputBackground: '#1C1C1E', // Almost Black
    inputBorder: '#3A3A3C', // Dark Grey
    inputFocusBorder: tintColorDark, // Use primary color for focus
    statusBar: 'light', // Light text/icons on dark background
  },
};
