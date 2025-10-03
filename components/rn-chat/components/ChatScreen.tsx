import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Keyboard,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ChatMessage } from './ChatMessage';
import { ChatMessage as ChatMessageType, UserType, FileType } from '../types';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

// Lucide icons
import { 
  Paperclip, 
  Send, 
  X, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Archive,
  File
} from 'lucide-react-native';

interface ChatScreenProps {
  messages: ChatMessageType[];
  currentUser: UserType | null;
  currentConversation: any;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  onSendMessage: (text: string, files?: File[]) => void;
  onAddMeeting: () => void;
  onUserPress?: (user: UserType) => void;
  onFilePress?: (file: any) => void;
  onLoadMore?: () => Promise<void>;
  hasNextPage?: boolean;
  fileUploadService?: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  currentUser,
  currentConversation,
  isLoading,
  isConnected,
  error,
  onSendMessage,
  onAddMeeting,
  onUserPress,
  onFilePress,
  onLoadMore,
  hasNextPage = false,
  fileUploadService,
}) => {
  const [messageText, setMessageText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileType[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Reverse messages for proper display order (newest at bottom)
  const reversedMessages = [...messages].reverse();

  // Handle keyboard show/hide events
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Auto scroll to bottom when keyboard opens
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Infinite scroll for messages
  const infiniteScroll = useInfiniteScroll({
    data: reversedMessages,
    onLoadMore: onLoadMore || (() => Promise.resolve()),
    hasNextPage,
    isLoading,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (currentConversation && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 200);
    }
  }, [currentConversation?.id]);

  // Auto-scroll to bottom when component first mounts with messages
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 300);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim() && attachedFiles.length === 0) return;

    // Get files that need to be uploaded (don't have response yet)
    const filesToUpload = attachedFiles
      .filter(file => !file.response)
      .map(file => file.file);

    console.log('Sending message with files:', {
      messageText,
      attachedFilesCount: attachedFiles.length,
      filesToUploadCount: filesToUpload.length,
      filesToUpload
    });

    // Send message with files - the useChat hook will handle uploading
    onSendMessage(messageText, filesToUpload.length > 0 ? filesToUpload : undefined);
    setMessageText('');
    setAttachedFiles([]);

    // Scroll to bottom after sending message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAttachFile = async () => {
    try {
      // Check if we can add more files (max 5)
      const maxFiles = 5;
      const currentFileCount = attachedFiles.length;
      
      if (currentFileCount >= maxFiles) {
        Alert.alert(
          'File Limit Reached',
          `You can only attach up to ${maxFiles} files. Please remove some files first.`
        );
        return;
      }

      const remainingSlots = maxFiles - currentFileCount;
      
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Limit to remaining slots
        const assetsToProcess = result.assets.slice(0, remainingSlots);
        
        // Convert DocumentPicker results to File objects
        const newFiles: FileType[] = assetsToProcess.map((file) => {
          console.log('Selected file:', file); // Debug log
          
          // Create a File-like object that works with the upload service
          const fileObject = {
            name: file.name || 'Unknown file',
            size: file.size || 0,
            type: file.mimeType || 'application/octet-stream',
            uri: file.uri,
            // Add additional properties that might be needed
            lastModified: Date.now(),
          } as any;
          
          return {
            file: fileObject,
            response: null,
          };
        });

        // Validate file sizes (max 10MB per file)
        const maxSize = 10 * 1024 * 1024; // 10MB
        const oversizedFiles = newFiles.filter(f => f.file.size > maxSize);
        
        if (oversizedFiles.length > 0) {
          Alert.alert(
            'File Too Large',
            `Some files are larger than 10MB and will be skipped. Please select smaller files.`
          );
          // Only add files that are within size limit
          const validFiles = newFiles.filter(f => f.file.size <= maxSize);
          if (validFiles.length > 0) {
            setAttachedFiles(prev => [...prev, ...validFiles]);
          }
        } else {
          setAttachedFiles(prev => [...prev, ...newFiles]);
        }
      }
    } catch (error: any) {
      console.error('File picker error:', error);
      Alert.alert(
        'File Selection Error',
        'Failed to select files. Please try again.'
      );
    }
  };

  const renderMessage = ({ item }: { item: ChatMessageType }) => (
    <ChatMessage
      message={item}
      currentUser={currentUser}
      onUserPress={onUserPress}
      onFilePress={onFilePress}
    />
  );

  // Get the other user's name for the header
  const getOtherUserName = () => {
    if (!currentConversation) return '';
    const otherUsers = currentConversation.users.filter(
      (user: UserType) => user.id !== currentUser?.id
    );
    return otherUsers.map((user: UserType) => user.get_full_name).join(', ');
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('word') || mimeType.includes('document')) return FileText;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return FileSpreadsheet;
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return Presentation;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return Archive;
    return File;
  };

  const renderAttachedFiles = () => {
    if (attachedFiles.length === 0) return null;

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
      <Card className="rounded-none border-b border-border bg-muted/30">
        <CardContent className="p-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium text-muted-foreground">
              Attached Files ({attachedFiles.length}/5)
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            {attachedFiles.map((file, index) => {
              const fileName = file.file?.name || 'Unknown file';
              const fileSize = file.file?.size || 0;
              const mimeType = file.file?.type || 'application/octet-stream';
              const FileIcon = getFileIcon(mimeType);
              
              return (
                <Card key={index} className="relative min-w-[140px] max-w-[200px] bg-background border-border">
                  <CardContent className="flex-row items-center gap-3 p-3">
                    <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
                      <Icon as={FileIcon} size={20} className="text-primary" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                        {fileName}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {formatFileSize(fileSize)}
                      </Text>
                    </View>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onPress={() => {
                        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <Icon as={X} size={12} className="text-white" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </ScrollView>
        </CardContent>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-lg font-medium text-muted-foreground text-center">
        {isConnected ? 'Start a conversation...' : 'Connecting...'}
      </Text>
    </View>
  );

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6">
            <Text className="text-center text-destructive font-medium">
              {error}
            </Text>
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={reversedMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmptyState}
          onScroll={infiniteScroll.onScroll}
          scrollEventThrottle={16}
          className="flex-1"
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
          onContentSizeChange={() => {
            // Auto scroll to bottom when content size changes (new messages)
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />

        {renderAttachedFiles()}

        <View className="border-t border-border bg-background px-4 py-3 pb-4">
          <View className="flex-row items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10",
                attachedFiles.length > 0 && "bg-primary/10"
              )}
              onPress={handleAttachFile}
            >
              <Icon as={Paperclip} size={20} className="text-muted-foreground" />
              {attachedFiles.length > 0 && (
                <Badge 
                  variant="default" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 items-center justify-center"
                >
                  <Text className="text-xs font-bold text-primary-foreground">
                    {attachedFiles.length}
                  </Text>
                </Badge>
              )}
            </Button>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

            <Input
              className="flex-1 min-h-[40px] max-h-[100px]"
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              multiline
              maxLength={1000}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={(e) => {
                if (!e.nativeEvent.text.includes('\n')) {
                  handleSendMessage();
                }
              }}
            />
            </KeyboardAvoidingView>

            <Button
              size="icon"
              className="h-10 w-10"
              onPress={handleSendMessage}
              disabled={!messageText.trim() && attachedFiles.length === 0}
            >
              <Icon as={Send} size={20} className="text-primary-foreground" />
            </Button>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};