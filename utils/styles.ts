import Layout from "@/constants/Layout";
import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  flexRowAlignCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.spacing.s,
  },
})