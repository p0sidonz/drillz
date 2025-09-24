import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ArrowLeftIcon, UserIcon, SaveIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import ApiService from '@/lib/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, fetchUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  console.log('EditProfileScreen - Current user data:', user);

  // Fetch complete user profile data
  const fetchCompleteUserProfile = async () => {
    if (!user?.username) return;
    
    try {
      const response = await ApiService.getUserProfile(user.username);
      console.log('Complete user profile data:', response.data);
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching complete user profile:', error);
    }
  };
  
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    title: '',
  });

  // Fetch complete user profile on mount
  useEffect(() => {
    fetchCompleteUserProfile();
  }, [user?.username]);

  // Initialize form with current user data
  useEffect(() => {
    const profileData = userProfile || user;
    if (profileData) {
      console.log('User data for edit profile:', profileData);
      console.log('Available user fields:', Object.keys(profileData));
      
      // Handle different possible field names
      const firstName = profileData.first_name || profileData.firstName || '';
      const lastName = profileData.last_name || profileData.lastName || '';
      
      setFormData({
        username: profileData.username || '',
        first_name: firstName,
        last_name: lastName,
        title: profileData.title || profileData.bio || profileData.description || '',
      });
    }
  }, [userProfile, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return false;
    }
    if (!formData.first_name.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!formData.last_name.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const usernameToUpdate = userProfile?.username || user?.username;
      if (!usernameToUpdate) {
        throw new Error('Username not found');
      }

      const response = await ApiService.updateUserProfile(usernameToUpdate, {
        username: formData.username.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        title: formData.title.trim(),
      });

      // Refresh user profile data
      await fetchUserProfile();
      
      Alert.alert(
        'Success', 
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            // onPress: () => {
            //   router.back();
            // }
          }
        ]
      );
    } catch (error: any) {
      console.error('Update profile error:', error);
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.data) {
        if (error.response.data.username) {
          errorMessage = `Username: ${error.response.data.username[0]}`;
        } else if (error.response.data.first_name) {
          errorMessage = `First Name: ${error.response.data.first_name[0]}`;
        } else if (error.response.data.last_name) {
          errorMessage = `Last Name: ${error.response.data.last_name[0]}`;
        } else if (error.response.data.title) {
          errorMessage = `Title: ${error.response.data.title[0]}`;
        } else if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors[0];
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
        <Button
          size="sm"
          variant="ghost"
          onPress={() => router.back()}
          className="h-8 w-8 p-0"
        >
          <Icon as={ArrowLeftIcon} size={20} />
        </Button>
        <Text className="text-lg font-semibold text-foreground">Edit Profile</Text>
        <Button
          size="sm"
          variant="ghost"
          onPress={handleSaveProfile}
          disabled={loading}
          className="h-8 px-3"
        >
          <Icon as={SaveIcon} size={16} className="mr-1" />
          <Text className="text-sm font-medium">
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </Button>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex-row items-center">
              <Icon as={UserIcon} size={16} className="mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Username */}
            <View>
              <Text className="text-sm font-medium mb-2">Username *</Text>
              <Input
                placeholder="Enter username"
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                className="w-full"
              />
            </View>

            {/* First Name */}
            <View>
              <Text className="text-sm font-medium mb-2">First Name *</Text>
              <Input
                placeholder="Enter first name"
                value={formData.first_name}
                onChangeText={(value) => handleInputChange('first_name', value)}
                className="w-full"
              />
            </View>

            {/* Last Name */}
            <View>
              <Text className="text-sm font-medium mb-2">Last Name *</Text>
              <Input
                placeholder="Enter last name"
                value={formData.last_name}
                onChangeText={(value) => handleInputChange('last_name', value)}
                className="w-full"
              />
            </View>

            {/* Title/Bio */}
            <View>
              <Text className="text-sm font-medium mb-2">Bio/Description</Text>
              <Textarea
                placeholder="Tell us about yourself..."
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                className="w-full min-h-[100px]"
                multiline
                numberOfLines={4}
              />
              <Text className="text-xs text-muted-foreground mt-1">
                {formData.title.length}/500 characters
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          size="sm"
          variant="secondary"
          onPress={handleSaveProfile}
          disabled={loading}
          className="w-full mb-4"
        >
          <Icon as={SaveIcon} size={16} className="mr-2" />
          <Text >
            {loading ? 'Saving Profile...' : 'Save Profile'}
          </Text>
        </Button>

      
      </ScrollView>
    </View>
  );
}
