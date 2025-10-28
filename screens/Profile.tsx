import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActionSheetIOS, Platform, PermissionsAndroid } from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { useAppStore } from '../store/AppStore';

export default function Profile() {
  const { user, updateProfile, logout, setScreen } = useAppStore();
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);

  const onSave = () => {
    updateProfile({ name, address, phone, profileImage: profileImage || undefined });
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const onEdit = () => {
    setIsEditing(true);
  };

  const onCancel = () => {
    setName(user?.name || '');
    setAddress(user?.address || '');
    setPhone(user?.phone || '');
    setIsEditing(false);
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Kimkles Cravings needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorMessage) {
        Alert.alert('Error', 'Camera error: ' + response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        setProfileImage(response.assets[0].uri || null);
        Alert.alert('Success', 'Photo taken successfully!');
      }
    });
  };

  const openImageLibrary = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        Alert.alert('Error', 'Image picker error: ' + response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        setProfileImage(response.assets[0].uri || null);
        Alert.alert('Success', 'Photo selected successfully!');
      }
    });
  };

  const showImagePicker = () => {
    const options = profileImage 
      ? ['Cancel', 'Take Photo', 'Choose from Library', 'Remove Photo']
      : ['Cancel', 'Take Photo', 'Choose from Library'];
    
    const cancelIndex = 0;
    const removeIndex = profileImage ? 3 : -1;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: cancelIndex,
          destructiveButtonIndex: removeIndex,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            // Take Photo
            const hasPermission = await requestCameraPermission();
            if (hasPermission) {
              openCamera();
            } else {
              Alert.alert('Permission Denied', 'Camera permission is required to take photos');
            }
          } else if (buttonIndex === 2) {
            // Choose from Library
            openImageLibrary();
          } else if (buttonIndex === removeIndex) {
            // Remove Photo
            setProfileImage(null);
            Alert.alert('Success', 'Profile photo removed successfully!');
          }
        }
      );
    } else {
      const alertOptions: any[] = [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Take Photo', 
          onPress: async () => {
            const hasPermission = await requestCameraPermission();
            if (hasPermission) {
              openCamera();
            } else {
              Alert.alert('Permission Denied', 'Camera permission is required to take photos');
            }
          }
        },
        { text: 'Choose from Library', onPress: openImageLibrary },
      ];

      if (profileImage) {
        alertOptions.push({
          text: 'Remove Photo',
          style: 'destructive',
          onPress: () => {
            setProfileImage(null);
            Alert.alert('Success', 'Profile photo removed successfully!');
          }
        });
      }

      Alert.alert('Select Photo', 'Choose an option', alertOptions);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      {/* <View style={styles.header}>
        <Image source={require('../images/kimkles_logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.title}>Profile</Text>
      </View> */}

      {/* Profile Picture Section */}
      <View style={styles.profilePictureSection}>
        <TouchableOpacity 
          style={styles.profilePictureContainer}
          onPress={showImagePicker}
          activeOpacity={0.8}
        >
          <Image 
            source={profileImage ? { uri: profileImage } : require('../images/kimkles_logo.png')} 
            style={styles.profilePicture} 
            resizeMode="cover" 
          />
          <View style={styles.profilePictureOverlay}>
            <Text style={styles.profilePictureIcon}>📷</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={showImagePicker} activeOpacity={0.7}>
          <Text style={styles.profilePictureText}>Tap to change photo</Text>
        </TouchableOpacity>
      </View>

      {/* User Info Card */}
      <View style={styles.userInfoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          {!isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              value={name} 
              onChangeText={setName} 
              style={[styles.input, !isEditing && styles.inputDisabled]} 
              placeholder="Enter your full name" 
              placeholderTextColor="#9CA3AF"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput 
              value={phone} 
              onChangeText={setPhone} 
              style={[styles.input, !isEditing && styles.inputDisabled]} 
              placeholder="Enter your phone number" 
              placeholderTextColor="#9CA3AF" 
              keyboardType="phone-pad"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput 
              value={address} 
              onChangeText={setAddress} 
              style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]} 
              placeholder="Enter your address" 
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              editable={isEditing}
            />
          </View>
        </View>
      </View>

      {/* Quick Actions Card */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => setScreen('orders')}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>📦</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>My Orders</Text>
            <Text style={styles.actionSubtitle}>View order history and status</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        {user?.role === 'admin' && (
          <TouchableOpacity style={styles.actionButton} onPress={() => setScreen('admin')}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>⚙️</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Admin Dashboard</Text>
              <Text style={styles.actionSubtitle}>Manage products and orders</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton} onPress={() => setScreen('home')}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>🏠</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Browse Menu</Text>
            <Text style={styles.actionSubtitle}>Explore our delicious treats</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={logout}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E8D8FF', 
    paddingHorizontal: 20,
    // paddingTop: 1,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 24,
    paddingVertical: 16,
  },
  headerLogo: { 
    width: 36, 
    height: 36, 
    marginRight: 12 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#111827' 
  },

  // Profile Picture Section
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  profilePicture: {
    width: 90,
    height: 100,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#FFB74D',
    backgroundColor: '#F3F4F6',
  },
  profilePictureOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#FFB74D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8D8FF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profilePictureIcon: {
    fontSize: 9,
  },
  profilePictureText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // User Info Card
  userInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  editButton: {
    backgroundColor: '#FFB74D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#FFB74D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  formSection: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: { 
    fontWeight: '600', 
    color: '#374151', 
    fontSize: 14 
  },
  input: { 
    backgroundColor: '#C8F9FD', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  // Actions Card
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 4,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEC9F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionArrow: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },

  // Sign Out Button
  signOutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#FEC9F0',
  },
  signOutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});
