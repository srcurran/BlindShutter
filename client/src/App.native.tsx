
import React, { useState } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function App() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const { data: images = [] } = useQuery({
    queryKey: ['/api/images'],
  });

  const { mutate: processImage, isPending } = useMutation({
    mutationFn: async (base64Image: string) => {
      console.log("Starting image processing request...");
      const response = await fetch('http://0.0.0.0:5000/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (!data.generatedImage) {
        throw new Error("No image was generated");
      }
      setResult(data.generatedImage);
      setProcessing(false);
    },
    onError: (error: any) => {
      console.error("Error in image processing:", error);
      setProcessing(false);
    },
  });

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("Camera permission is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].base64) {
      setProcessing(true);
      setResult(null);
      processImage(result.assets[0].base64);
    }
  };

  return (
    <View style={styles.container}>
      {!processing && !result && (
        <TouchableOpacity onPress={takePhoto} style={styles.button}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      )}

      {(processing || isPending) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Creating your masterpiece...</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Image 
            source={{ uri: result }} 
            style={styles.resultImage} 
          />
          <TouchableOpacity 
            onPress={() => {
              setResult(null);
              setProcessing(false);
            }}
            style={styles.resetButton}
          >
            <Text style={styles.buttonText}>Take Another Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
  },
});
