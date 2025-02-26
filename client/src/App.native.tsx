
import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function App() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const cameraRef = useRef<RNCamera | null>(null);

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

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 0.7, base64: true };
        const data = await cameraRef.current.takePictureAsync(options);
        if (data.base64) {
          setProcessing(true);
          setResult(null);
          processImage(data.base64);
        }
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {!processing && !result && (
        <RNCamera
          ref={cameraRef}
          style={styles.camera}
          type={RNCamera.Constants.Type.back}
          captureAudio={false}
        >
          <TouchableOpacity onPress={takePicture} style={styles.button}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </RNCamera>
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
  },
  camera: {
    flex: 1,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 10,
    margin: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
