import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar as SB } from 'react-native';
import Home from './src/pages/home';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Home></Home>
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? SB.currentHeight : 0
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
