"use client"

import { useState } from "react"
import { View, ScrollView, Text, TouchableOpacity, Image, SafeAreaView, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"

export default function HomeScreen() {
  const router = useRouter()
  const [expanded, setExpanded] = useState(true)

  const menuItems = [
    { icon: "home", label: "Home", key: "home" },
    { icon: "swap-horizontal", label: "Timeline", key: "timeline" },
    { icon: "map", label: "Map View", key: "map" },
    { icon: "people", label: "Groups", key: "groups" },
    { icon: "images", label: "Albums", key: "albums" },
  ]

  const helpItems = [
    { icon: "call", label: "Contact Support", action: "contact" },
    { icon: "settings", label: "Settings", action: "settings" },
    { icon: "globe", label: "Switch Language", action: "language" },
    { icon: "log-out", label: "Log out", action: "logout" },
  ]

  const handleMenuPress = (action: string) => {
    if (action === "settings") {
      router.push("/profile")
    } else if (action === "language") {
      router.push("/profile")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: "https://i.pravatar.cc/150?img=1" }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Jackson Jackie</Text>
            <Text style={styles.profileSubtitle}>Pro</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Main Navigation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Navigation</Text>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.key} style={styles.menuItem}>
              <Ionicons name={item.icon as any} size={20} color="#00d4ff" />
              <Text style={styles.menuItemText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#7a9abf" style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          {helpItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handleMenuPress(item.action)}>
              <Ionicons name={item.icon as any} size={20} color="#00d4ff" />
              <Text style={styles.menuItemText}>{item.label}</Text>
              {item.action === "logout" && (
                <Text style={[styles.menuItemText, { color: "#ff4444", marginLeft: "auto" }]}>Sign Out</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a2f4d",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  profileSubtitle: {
    fontSize: 12,
    color: "#00d4ff",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7a9abf",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#243656",
    marginBottom: 8,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 12,
  },
})
