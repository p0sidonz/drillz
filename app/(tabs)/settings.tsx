import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ArrowLeftIcon, LockIcon, EyeIcon, EyeOffIcon, UserIcon, EditIcon, MailIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import ApiService from '@/lib/api';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [emailFormData, setEmailFormData] = useState({
    currentPassword: '',
    newEmail: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailInputChange = (field: string, value: string) => {
    setEmailFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      Alert.alert('Error', 'Current password is required');
      return false;
    }
    if (!formData.newPassword) {
      Alert.alert('Error', 'New password is required');
      return false;
    }
    if (formData.newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return false;
    }
    return true;
  };

  const validateEmailForm = () => {
    if (!emailFormData.currentPassword) {
      Alert.alert('Error', 'Current password is required');
      return false;
    }
    if (!emailFormData.newEmail) {
      Alert.alert('Error', 'New email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailFormData.newEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (emailFormData.newEmail === user?.email) {
      Alert.alert('Error', 'New email must be different from current email');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await ApiService.changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        confirm_new_password: formData.confirmPassword,
      });

      // Get new token from response
      const newToken = response.data.key;
      
      if (newToken) {
        // Update auth context with new token
        await updateToken(newToken);
        
        Alert.alert(
          'Success', 
          'Password changed successfully! Your session has been updated.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setFormData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
                // Navigate back
                router.back();
              }
            }
          ]
        );
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      let errorMessage = 'Failed to change password';
      
      if (error.response?.data) {
        if (error.response.data.current_password) {
          errorMessage = error.response.data.current_password[0];
        } else if (error.response.data.new_password) {
          errorMessage = error.response.data.new_password[0];
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

  const handleChangeEmail = async () => {
    if (!validateEmailForm()) return;

    setLoading(true);
    try {
      const response = await ApiService.changeEmail({
        current_password: emailFormData.currentPassword,
        email: emailFormData.newEmail,
      });

      // Update user profile data
      await fetchUserProfile();
      
      Alert.alert(
        'Success', 
        'Email changed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setEmailFormData({
                currentPassword: '',
                newEmail: '',
              });
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Change email error:', error);
      let errorMessage = 'Failed to change email';
      
      if (error.response?.data) {
        if (error.response.data.current_password) {
          errorMessage = error.response.data.current_password[0];
        } else if (error.response.data.email) {
          errorMessage = error.response.data.email[0];
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
        <Text className="text-lg font-semibold text-foreground">Settings</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* User Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Icon as={UserIcon} size={16} className="mr-2" />
                Account Information
              </View>
              <Button
                size="sm"
                variant="outline"
                onPress={() => router.push('/(tabs)/edit-profile')}
                className="h-8 px-3"
              >
                <Icon as={EditIcon} size={14} className="mr-1" />
                <Text className="text-xs">Edit</Text>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-2">
              <View>
                <Text className="text-sm text-muted-foreground mb-1">Username</Text>
                <Text className="text-base font-medium">{user?.username}</Text>
              </View>
              <View>
                <Text className="text-sm text-muted-foreground mb-1">Full Name</Text>
                <Text className="text-base font-medium">{user?.get_full_name || 'Not provided'}</Text>
              </View>
              <View>
                <Text className="text-sm text-muted-foreground mb-1">Email</Text>
                <Text className="text-base font-medium">{user?.email || 'Not provided'}</Text>
              </View>
              {user?.title && (
                <View>
                  <Text className="text-sm text-muted-foreground mb-1">Bio</Text>
                  <Text className="text-base font-medium">{user.title}</Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex-row items-center">
              <Icon as={LockIcon} size={16} className="mr-2" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Password */}
            <View>
              <Text className="text-sm font-medium mb-2">Current Password</Text>
              <View className="relative">
                <Input
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChangeText={(value) => handleInputChange('currentPassword', value)}
                  secureTextEntry={!showCurrentPassword}
                  className="pr-10"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                >
                  <Icon 
                    as={showCurrentPassword ? EyeOffIcon : EyeIcon} 
                    size={16} 
                    className="text-muted-foreground" 
                  />
                </Button>
              </View>
            </View>

            {/* New Password */}
            <View>
              <Text className="text-sm font-medium mb-2">New Password</Text>
              <View className="relative">
                <Input
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChangeText={(value) => handleInputChange('newPassword', value)}
                  secureTextEntry={!showNewPassword}
                  className="pr-10"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                >
                  <Icon 
                    as={showNewPassword ? EyeOffIcon : EyeIcon} 
                    size={16} 
                    className="text-muted-foreground" 
                  />
                </Button>
              </View>
            </View>

            {/* Confirm New Password */}
            <View>
              <Text className="text-sm font-medium mb-2">Confirm New Password</Text>
              <View className="relative">
                <Input
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  className="pr-10"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                >
                  <Icon 
                    as={showConfirmPassword ? EyeOffIcon : EyeIcon} 
                    size={16} 
                    className="text-muted-foreground" 
                  />
                </Button>
              </View>
            </View>

            {/* {isOwnProfile ? (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={handleSettings}
                  className="w-24"
                >
                  <Icon 
                    as={SettingsIcon} 
                    size={16} 
                    className="mr-1" 
                  />
                  <Text>Settings</Text>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={following ? "outline" : "default"}
                  onPress={handleFollow}
                  disabled={followLoading}
                  className="w-24"
                >
                  <Icon 
                    as={following ? UserMinusIcon : UserPlusIcon} 
                    size={16} 
                    color={following ? 'red' : 'white'}
                    className="mr-1" 
                  /> */}

            {/* Change Password Button */}
            <Button
              size="sm"
              variant="secondary"
              onPress={handleChangePassword}
              disabled={loading}
              className="w-full mt-2"
            >
              <Text>
                {loading ? 'Changing Password...' : 'Change Password'}
              </Text>
            </Button>
          </CardContent>
        </Card>

        {/* Change Email */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex-row items-center">
              <Icon as={MailIcon} size={16} className="mr-2" />
              Change Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Password */}
            <View>
              <Text className="text-sm font-medium mb-2">Current Password</Text>
              <View className="relative">
                <Input
                  placeholder="Enter current password"
                  value={emailFormData.currentPassword}
                  onChangeText={(value) => handleEmailInputChange('currentPassword', value)}
                  secureTextEntry={!showCurrentPassword}
                  className="pr-10"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                >
                  <Icon 
                    as={showCurrentPassword ? EyeOffIcon : EyeIcon} 
                    size={16} 
                    className="text-muted-foreground" 
                  />
                </Button>
              </View>
            </View>

            {/* New Email */}
            <View>
              <Text className="text-sm font-medium mb-2">New Email</Text>
              <Input
                placeholder="Enter new email address"
                value={emailFormData.newEmail}
                onChangeText={(value) => handleEmailInputChange('newEmail', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full"
              />
            </View>

            {/* Change Email Button */}
            <Button
              size="sm"
              variant="secondary"
              onPress={handleChangeEmail}
              disabled={loading}
              className="w-full mt-2"
            >
              <Text >
                {loading ? 'Changing Email...' : 'Change Email'}
              </Text>
            </Button>
          </CardContent>
        </Card>

       
      </ScrollView>
    </View>
  );
}
