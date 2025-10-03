import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Image, Dimensions, Animated, Platform, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CameraIcon, VideoIcon, MapPinIcon, XIcon, ImageIcon, RefreshCw, Check, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react-native';
import { CameraView, CameraType, CameraMode, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useColorScheme } from 'nativewind';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

interface MediaFile {
  uri: string;
  type: 'image' | 'video';
  fileName?: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: isDark ? '#fff' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  shadowLarge: {
    ...Platform.select({
      ios: {
        shadowColor: isDark ? '#fff' : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.4 : 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradientOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  gradientOverlayLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  blueGradient: {
    backgroundColor: '#3B82F6',
  },
  whiteBackdrop: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

function CreateScreenContent() {
  // Theme
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);
  
  // States
  const [step, setStep] = useState(0); // 0: Camera, 1: Media Selection, 2: Description, 3: Preview
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [showCamera, setShowCamera] = useState(true);
  const [capturedMedia, setCapturedMedia] = useState<MediaFile[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [cameraMode, setCameraMode] = useState<CameraMode>('picture');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Refs
  const cameraRef = useRef<CameraView>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Initialize
  useEffect(() => {
    initializeApp();
    animateIn();
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    animateIn();
  }, [step]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const initializeApp = async () => {
    try {
      // Request permissions
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
      if (!microphonePermission?.granted) {
        await requestMicrophonePermission();
      }

      // Get location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        
        // Set location data without address first
        setLocationData({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Try to get address with timeout
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Geocoding timeout')), 5000)
          );
          
          const geocodePromise = Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          const [address] = await Promise.race([geocodePromise, timeoutPromise]) as any;
          
          if (address) {
            setLocationData({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              address: `${address.street || ''}, ${address.city || ''}`.trim(),
            });
          }
        } catch (error) {
          console.log('Could not get address, using coordinates only');
        }
      }
    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        const newMedia: MediaFile = {
          uri: photo.uri,
          type: 'image',
          fileName: `photo_${Date.now()}.jpg`,
        };
        setCapturedMedia(prev => [...prev, newMedia]);
        setSelectedMedia(prev => [...prev, newMedia]);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        setRecordingDuration(0);
        
        const recordPromise = cameraRef.current.recordAsync({
          maxDuration: 60,
        });

        recordingIntervalRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);

        const video = await recordPromise;
        if (video) {
          const newMedia: MediaFile = {
            uri: video.uri,
            type: 'video',
            fileName: `video_${Date.now()}.mp4`,
          };
          setCapturedMedia(prev => [...prev, newMedia]);
          setSelectedMedia(prev => [...prev, newMedia]);
        }

        setIsRecording(false);
        setRecordingDuration(0);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      } catch (error) {
        console.error('Recording error:', error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      try {
        await cameraRef.current.stopRecording();
        setIsRecording(false);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      } catch (error) {
        console.error('Stop recording error:', error);
      }
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets) {
        const newMedia: MediaFile[] = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          fileName: asset.fileName || undefined,
        }));
        setCapturedMedia(prev => [...prev, ...newMedia]);
        setSelectedMedia(prev => [...prev, ...newMedia]);
      }
    } catch (error) {
      console.error('Gallery error:', error);
    }
  };

  const toggleMediaSelection = (media: MediaFile) => {
    setSelectedMedia(prev => {
      const isSelected = prev.some(item => item.uri === media.uri);
      if (isSelected) {
        return prev.filter(item => item.uri !== media.uri);
      } else {
        return [...prev, media];
      }
    });
  };

  const removeMedia = (mediaUri: string) => {
    setCapturedMedia(prev => prev.filter(media => media.uri !== mediaUri));
    setSelectedMedia(prev => prev.filter(media => media.uri !== mediaUri));
  };

  const handleCreate = async () => {
    if (selectedMedia.length === 0 || !description.trim()) {
      Alert.alert('Error', 'Please add media and description');
      return;
    }
    
    setIsCreating(true);
    try {
      // TODO: Upload to API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('Success', 'Post created successfully!');
      setDescription('');
      setCapturedMedia([]);
      setSelectedMedia([]);
      setStep(0);
      setShowCamera(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setIsCreating(false);
    }
  };

  const nextStep = () => {
    console.log('nextStep - current step:', step);
    console.log('nextStep - capturedMedia length:', capturedMedia.length);
    
    if (step === 0 && capturedMedia.length > 0) {
      console.log('Moving from step 0 to 1');
      setShowCamera(false);
      setStep(1);
    } else if (step < 3) {
      console.log('Moving from step', step, 'to', step + 1);
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
      if (step === 1) {
        setShowCamera(true);
      }
    }
  };

  // Camera Screen
  if (showCamera && step === 0) {
  return (
      <View className="flex-1 bg-black">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={cameraType}
          mode={cameraMode}
        />
        
          {/* Overlay */}
          <View className="absolute inset-0">
            {/* Top Bar */}
            <View className="pt-14 px-6 pb-6" style={styles.gradientOverlay}>
              <View className="flex-row justify-between items-center">
                <TouchableOpacity
                  onPress={() => setCameraType(cameraType === 'back' ? 'front' : 'back')}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={styles.whiteBackdrop}
                >
                  <RefreshCw size={20} color="white" />
                </TouchableOpacity>
              
              {isRecording && (
                <View className="flex-row items-center rounded-full px-4 py-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)' }}>
                  <View className="w-2 h-2 bg-white rounded-full mr-2" />
                  <Text className="text-white text-sm font-semibold">{recordingDuration}s</Text>
                </View>
              )}
              
              <TouchableOpacity
                onPress={() => {
                  if (capturedMedia.length > 0) {
                    setShowCamera(false);
                    setStep(1);
                  }
                }}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={styles.whiteBackdrop}
              >
                <XIcon size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mode Selector */}
          <View className="absolute top-32 left-0 right-0 items-center">
            <View className="flex-row rounded-full p-1" style={styles.gradientOverlayLight}>
              <TouchableOpacity
                onPress={() => setCameraMode('picture')}
                className={`px-6 py-2 rounded-full ${cameraMode === 'picture' ? 'bg-white' : ''}`}
              >
                <Text className={`text-sm font-semibold ${cameraMode === 'picture' ? 'text-black' : 'text-white'}`}>
                  Photo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCameraMode('video')}
                className={`px-6 py-2 rounded-full ${cameraMode === 'video' ? 'bg-white' : ''}`}
              >
                <Text className={`text-sm font-semibold ${cameraMode === 'video' ? 'text-black' : 'text-white'}`}>
                  Video
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Controls */}
          <View className="absolute bottom-0 left-0 right-0 pb-10 pt-20" style={styles.gradientOverlay}>
            {/* Media Counter */}
            {capturedMedia.length > 0 && (
              <View className="absolute top-6 left-6">
                <TouchableOpacity
                  onPress={nextStep}
                  className="rounded-full px-4 py-2 flex-row items-center"
                  style={styles.blueGradient}
                >
                  <Text className="text-white text-sm font-semibold mr-2">
                    {capturedMedia.length} media
                  </Text>
                  <ArrowRight size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}

            <View className="flex-row justify-center items-center px-8">
              {/* Capture Button */}
              {cameraMode === 'picture' ? (
                <TouchableOpacity
                  onPress={takePicture}
                  className="w-20 h-20 rounded-full bg-white items-center justify-center"
                  style={styles.shadowLarge}
                >
                  <View className="w-16 h-16 rounded-full border-4 border-white bg-transparent" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  className={`w-20 h-20 rounded-full items-center justify-center ${
                    isRecording ? 'bg-red-500' : 'bg-white'
                  }`}
                  style={styles.shadowLarge}
                >
                  {isRecording ? (
                    <View className="w-8 h-8 bg-white rounded-lg" />
                  ) : (
                    <View className="w-16 h-16 rounded-full bg-red-500" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Permission Screen
  if (!cameraPermission?.granted || !microphonePermission?.granted) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
          <CameraIcon size={32} className="text-primary" />
        </View>
        <Text className="text-2xl font-bold text-foreground mb-3 text-center">
          Camera Access Required
        </Text>
        <Text className="text-base text-muted-foreground text-center mb-8">
          We need access to your camera and microphone to help you create amazing posts
        </Text>
        <Button onPress={initializeApp} className="w-full py-4 rounded-xl">
          <Text className="text-primary-foreground font-semibold text-base">Grant Permissions</Text>
        </Button>
      </View>
    );
  }

  // Step 1: Media Selection
  if (step === 1) {
    return (
      <Animated.View 
        style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        className="bg-background"
      >
        <View className="flex-1">
          {/* Header */}
          <View className="pt-14 px-6 pb-4 border-b border-border">
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity onPress={prevStep} className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                <ArrowLeft size={20} className="text-foreground" />
              </TouchableOpacity>
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-2">
                  <Text className="text-primary-foreground text-xs font-bold">1</Text>
                </View>
                <View className="w-8 h-1 bg-muted rounded-full mr-2" />
                <View className="w-8 h-8 rounded-full bg-muted items-center justify-center mr-2">
                  <Text className="text-muted-foreground text-xs font-bold">2</Text>
                </View>
                <View className="w-8 h-1 bg-muted rounded-full mr-2" />
                <View className="w-8 h-8 rounded-full bg-muted items-center justify-center">
                  <Text className="text-muted-foreground text-xs font-bold">3</Text>
                </View>
              </View>
              <View className="w-10" />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2">Select Media</Text>
            <Text className="text-base text-muted-foreground">Choose what you want to share</Text>
          </View>

          <ScrollView className="flex-1 px-6 pt-6">
            {/* Add More Button */}

            {/* Media Grid */}
            {capturedMedia.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-bold text-foreground mb-4">
                  Your Media ({selectedMedia.length}/{capturedMedia.length})
                </Text>
                <View className="flex-row flex-wrap -mx-1">
                  {capturedMedia.map((media, index) => {
                    const isSelected = selectedMedia.some(item => item.uri === media.uri);
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => toggleMediaSelection(media)}
                        className="w-1/3 p-1"
                      >
                        <View className={`relative rounded-2xl overflow-hidden ${isSelected ? 'ring-4 ring-blue-500' : ''}`}>
                          <Image
                            source={{ uri: media.uri }}
                            className="w-full aspect-square"
                            resizeMode="cover"
                          />
                          {media.type === 'video' && (
                            <View className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
                              <VideoIcon size={14} color="white" />
                            </View>
                          )}
                          {isSelected && (
                            <View className="absolute top-2 left-2 bg-blue-500 rounded-full p-1.5">
                              <Check size={14} color="white" />
                            </View>
                          )}
                          <TouchableOpacity
                            onPress={() => removeMedia(media.uri)}
                            className="absolute bottom-2 right-2 bg-red-500 rounded-full p-1.5"
                          >
                            <XIcon size={14} color="white" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Button */}
          <View className="p-6 border-t border-border bg-background">
            <Button
              onPress={nextStep}
              disabled={selectedMedia.length === 0}
              className="w-full rounded-xl"
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-primary-foreground font-semibold">Continue</Text>
                <ArrowRight size={20} color="white" />
              </View>
            </Button>
          </View>
        </View>
      </Animated.View>
    );
  }

  // Step 2: Description
  if (step === 2) {
    return (
      <Animated.View 
        style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        className="bg-background"
      >
        <View className="flex-1">
          {/* Header */}
          <View className="pt-14 px-6 pb-4 border-b border-border">
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity onPress={prevStep} className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                <ArrowLeft size={20} className="text-foreground" />
              </TouchableOpacity>
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-2">
                  <Check size={14} color="white" />
                </View>
                <View className="w-8 h-1 bg-primary rounded-full mr-2" />
                <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-2">
                  <Text className="text-primary-foreground text-xs font-bold">2</Text>
                </View>
                <View className="w-8 h-1 bg-muted rounded-full mr-2" />
                <View className="w-8 h-8 rounded-full bg-muted items-center justify-center">
                  <Text className="text-muted-foreground text-xs font-bold">3</Text>
                </View>
              </View>
              <View className="w-10" />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2">Tell Your Story</Text>
            <Text className="text-base text-muted-foreground">Add a caption to your post</Text>
          </View>

          <ScrollView className="flex-1 px-6 pt-6">
            {/* Description Input */}
            <View className="bg-muted rounded-2xl p-4 mb-6">
              <Textarea
                placeholder="What's on your mind? Share your thoughts..."
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                value={description}
                onChangeText={setDescription}
                className="min-h-[200px] text-base text-foreground bg-transparent"
                maxLength={500}
              />
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-sm text-muted-foreground">Add description</Text>
                <Text className="text-sm text-muted-foreground">{description.length}/500</Text>
              </View>
            </View>

            {/* Location Card */}
            {locationData && (
              <View className="bg-muted/50 rounded-2xl p-4 mb-6 border border-border">
                <View className="flex-row items-start">
                  <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
                    <MapPinIcon size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground mb-1">Location</Text>
                    <Text className="text-xs text-foreground">{locationData.address || 'Unknown location'}</Text>
                    <Text className="text-xs text-muted-foreground mt-1">
                      {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Button */}
          <View className="p-6 border-t border-border bg-background">
            <Button
              onPress={nextStep}
              disabled={!description.trim()}
              className="w-full py-4 rounded-xl"
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-primary-foreground font-semibold">Preview</Text>
              </View>
            </Button>
          </View>
        </View>
      </Animated.View>
    );
  }

  if (step === 3) {
    return (
      <Animated.View 
      style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      className="bg-background"
    >
      <View className="flex-1">
        {/* Header */}
        <View className="pt-14 px-6 pb-4 border-b border-border">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={prevStep} className="w-10 h-10 rounded-full bg-muted items-center justify-center">
              <ArrowLeft size={20} className="text-foreground" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-2">
                <Check size={14} color="white" />
              </View>
              <View className="w-8 h-1 bg-primary rounded-full mr-2" />
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-2">
                <Check size={14} color="white" />
              </View>
              <View className="w-8 h-1 bg-primary rounded-full mr-2" />
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                <Sparkles size={14} color="white" />
              </View>
            </View>
            <View className="w-10" />
          </View>
          <Text className="text-3xl font-bold text-foreground mb-2">Final Preview</Text>
          <Text className="text-base text-muted-foreground">Review before posting</Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          {/* Media Preview */}
          <View className="mb-6">
            <ScrollView 
              horizontal 
              pagingEnabled
              showsHorizontalScrollIndicator={false} 
              className="rounded-3xl overflow-hidden bg-black"
            >
              {selectedMedia.map((media, index) => (
                <View key={index} className="relative" style={{ width: Dimensions.get('window').width - 48 }}>
                  <Image
                    source={{ uri: media.uri }}
                    style={{ width: Dimensions.get('window').width - 48, height: Dimensions.get('window').width - 48 }}
                    resizeMode="cover"
                  />
                  {media.type === 'video' && (
                    <View className="absolute bottom-4 right-4 bg-black/70 rounded-full px-3 py-1.5 flex-row items-center">
                      <VideoIcon size={14} color="white" />
                      <Text className="text-white text-xs font-medium ml-1">Video</Text>
                    </View>
                  )}
                  {selectedMedia.length > 1 && (
                    <View className="absolute top-4 right-4 bg-black/70 rounded-full px-3 py-1.5">
                      <Text className="text-white text-xs font-medium">
                        {index + 1}/{selectedMedia.length}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-foreground mb-3">Caption</Text>
            <Text className="text-base text-foreground leading-6">{description}</Text>
          </View>

          {/* Location */}
          {locationData && (
            <View className="mb-6">
              <Text className="text-xl font-semibold text-foreground mb-3">Location</Text>
              <View className="flex-row items-center bg-muted rounded-2xl p-4">
                <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
                  <MapPinIcon size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground">
                    {locationData.address || 'Location tagged'}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Stats */}
          <View className="flex-row items-center justify-around bg-muted rounded-2xl p-4 mb-6">
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground">{selectedMedia.length}</Text>
              <Text className="text-xs text-muted-foreground mt-1">Media</Text>
            </View>
            <View className="w-px h-10 bg-border" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground">{description.length}</Text>
              <Text className="text-xs text-muted-foreground mt-1">Characters</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View className="p-6 bg-background border-t border-border">
          <Button
            onPress={handleCreate}
            disabled={isCreating}
            className="w-full py-5 rounded-2xl"
          >
            {isCreating ? (
              <Text >Creating Post...</Text>
            ) : (
              <View className="flex-row items-center justify-center">
                <Text >Publish Post</Text>
              </View>
            )}
          </Button>
        </View>
      </View>
    </Animated.View>
    );
  }

  // Fallback (should never reach here)
  return null;
}

export default function CreateScreen() {
  try {
    return <CreateScreenContent />;
  } catch (error) {
    console.error('CreateScreen error:', error);
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-lg text-foreground text-center">Something went wrong</Text>
        <Text className="text-sm text-muted-foreground text-center mt-2">Please try again</Text>
      </View>
    );
  }
}
