import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/utils/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

const Profile = () => {
  const [image, setImage] = useState<string | null>(null);

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

      await supabase.storage.from("avatars").upload(filePath, decode(base64), {
        contentType,
      });
    }
  };

  return (
    <View>
      <View style={styles.avatar}>
        {image ? (
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
        >
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  avatar: {
    width: 200,
    height: 200,
    backgroundColor: "#ccc",
    alignSelf: "center",
    borderRadius: 100,
    margin: 40,
  },
});
