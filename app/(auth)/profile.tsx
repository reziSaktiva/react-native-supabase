import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/utils/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { useSystem } from "@/powersync/drizzle/PowerSync";

const Profile = () => {
  const [image, setImage] = useState<string | null>('https://static.vecteezy.com/system/resources/previews/020/765/399/non_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const { supabaseConnector } = useSystem();

  useEffect(() => {
    loadUserAvatar();
  }, []);

  const loadUserAvatar = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserData(user as any);
      // const { data } = supabase.storage
      //   .from("avatars")
      //   .getPublicUrl(`${user.id}/avatar.png`);

      // if (data?.publicUrl) {
      //   setImage(data.publicUrl);
      // }
    } catch (error) {
      console.log("Error loading avatar:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You need to enable permission to access the photo library!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setLoading(true);
      try {
        setImage(result.assets[0].uri);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        const img = result.assets[0];
        const base64 = await FileSystem.readAsStringAsync(img.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const filePath = `${user?.id}/avatar.png`;
        const contentType = "image/png";

        await supabase.storage
          .from("avatars")
          .upload(filePath, decode(base64), {
            contentType,
            upsert: true,
          });
      } catch (error) {
        console.log("Error uploading file:", error);
        console.log("Error:", JSON.stringify(error, null, 2));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: "#fff" }}>Uploading...</Text>
          </View>
        ) : image ? (
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: "100%", borderRadius: 50 }}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff" }}>No Image</Text>
          </View>
        )}
        <Pressable
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: "#0a7ea4",
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={pickImage}
          disabled={loading}
        >
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
            +
          </Text>
        </Pressable>
      </View>
      <View style={styles.profileNameContainer}>
        <Text style={styles.profileName}>{userData?.email}</Text>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151515",
  },
  avatar: {
    width: 200,
    height: 200,
    backgroundColor: "#ccc",
    alignSelf: "center",
    borderRadius: 100,
    margin: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  profileNameContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    color: "#fff",
    fontSize: 24,
  },
});
