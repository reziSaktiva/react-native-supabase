import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useSystem } from "@/powersync/PowerSync";
import { AuthError } from "@supabase/supabase-js";

const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { supabaseConnector } = useSystem();

  const onSignInPress = async () => {
    setLoading(true);
    try {
      await supabaseConnector.login(email, password);
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  const onSignUpPress = async () => {
    setLoading(true);
    try {
      const { session, error } = await supabaseConnector.signUp(
        email,
        password
      );

      if (error) {
        const authError = error as AuthError;
        Alert.alert("Error", authError.message);
      }

      if (!session) {
        Alert.alert("Error", "An unexpected error occurred");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text
            style={{
              color: "#fff",
            }}
          >
            Loading...
          </Text>
        </View>
      )}
      <Text style={styles.header}>Galaxies.dev</Text>
      <TextInput
        style={styles.inputField}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.inputField}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry={true}
        placeholderTextColor="#999"
      />
      <TouchableOpacity onPress={onSignInPress} style={styles.button}>
        <Text>Sign In</Text>
      </TouchableOpacity>
      <Button title="Sign Up" onPress={onSignUpPress} color="#151515" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
    padding: 20,
    backgroundColor: "#151515",
  },
  header: {
    fontSize: 30,
    textAlign: "center",
    margin: 50,
    color: "#fff",
  },
  inputField: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 4,
    padding: 10,
    color: "#fff",
    backgroundColor: "#363636",
  },
  button: {
    marginVertical: 15,
    alignItems: "center",
    backgroundColor: "#2b825b",
    padding: 12,
    borderRadius: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    elevation: 1,
    gap: 10,
  },
});

export default Page;
