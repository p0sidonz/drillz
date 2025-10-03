import React from 'react';
import { View, Image, TouchableOpacity, Linking } from 'react-native';
import { ChatMessage as ChatMessageType, UserType } from '../types';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

// Lucide icons
import { 
  Copy, 
  ExternalLink, 
  Download,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  FileSpreadsheet,
  Presentation,
  Archive
} from 'lucide-react-native';

interface ChatMessageProps {
  message: ChatMessageType;
  currentUser: UserType | null;
  onUserPress?: (user: UserType) => void;
  onFilePress?: (file: any) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUser,
  onUserPress,
  onFilePress,
}) => {
  const isOwnMessage = message.sender.id === currentUser?.id;

  const handleUserPress = () => {
    onUserPress?.(message.sender);
  };

  const handleFilePress = (file: any) => {
    onFilePress?.(file);
  };

  const copyMeetingLink = async () => {
    // In React Native, you'd use Clipboard from @react-native-clipboard/clipboard
    // await Clipboard.setString(message.content);
    console.log('Meeting link copied:', message.content);
  };

  const joinMeeting = () => {
    Linking.openURL(message.content);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

  return (
    <View className={cn(
      "px-4 py-2 mb-1",
      isOwnMessage ? "items-end" : "items-start"
    )}>
      <View className={cn(
        "flex-row gap-3 max-w-[85%]",
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        {!isOwnMessage && (
          <TouchableOpacity 
            onPress={handleUserPress} 
            className="w-8 h-8 rounded-full overflow-hidden mt-1 flex-shrink-0"
            activeOpacity={0.7}
          >
            {message.sender.avatar ? (
              <Image 
                source={{ uri: message.sender.avatar }} 
                className="w-full h-full" 
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-primary items-center justify-center">
                <Text className="text-sm font-semibold text-primary-foreground">
                  {message.sender.get_full_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Message Content */}
        <View className="flex-1">
          {/* Sender info and timestamp */}
          {!isOwnMessage && (
            <View className="flex-row items-center gap-2 mb-1">
              <TouchableOpacity onPress={handleUserPress} activeOpacity={0.7}>
                <Text className="text-sm font-medium text-foreground">
                  {message.sender.get_full_name}
                </Text>
              </TouchableOpacity>
              <Text className="text-xs text-muted-foreground">
                {formatDate(message.created)}
              </Text>
            </View>
          )}

          {/* Message bubble */}
          <View className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isOwnMessage 
              ? "bg-primary rounded-br-md" 
              : "bg-card border border-border rounded-bl-md"
          )}>
            {/* Message text */}
            <Text className={cn(
              "text-base leading-5",
              isOwnMessage 
                ? "text-primary-foreground" 
                : "text-foreground"
            )}>
              {message.content}
            </Text>

            {/* Files */}
            {message.files.length > 0 && (
              <View className="mt-3 gap-2">
                {message.files.map((file) => {
                  const FileIcon = getFileIcon(file.mimetype);
                  return (
                    <TouchableOpacity
                      key={file.id}
                      onPress={() => handleFilePress(file)}
                      activeOpacity={0.8}
                    >
                      <Card className={cn(
                        "border-0 shadow-sm",
                        isOwnMessage 
                          ? "bg-primary-foreground/10" 
                          : "bg-muted/50"
                      )}>
                        <CardContent className="flex-row items-center gap-3 p-3">
                          {/* File icon */}
                          <View className={cn(
                            "w-10 h-10 rounded-lg items-center justify-center",
                            isOwnMessage 
                              ? "bg-primary-foreground/20" 
                              : "bg-primary/10"
                          )}>
                            <Icon 
                              as={FileIcon} 
                              size={18} 
                              className={cn(
                                isOwnMessage 
                                  ? "text-primary-foreground" 
                                  : "text-primary"
                              )}
                            />
                          </View>
                          
                          {/* File info */}
                          <View className="flex-1 min-w-0">
                            <Text 
                              className={cn(
                                "text-sm font-medium",
                                isOwnMessage 
                                  ? "text-primary-foreground" 
                                  : "text-foreground"
                              )} 
                              numberOfLines={1}
                            >
                              {file.filename}
                            </Text>
                            <Text 
                              className={cn(
                                "text-xs mt-0.5",
                                isOwnMessage 
                                  ? "text-primary-foreground/70" 
                                  : "text-muted-foreground"
                              )}
                            >
                              {file.size ? formatFileSize(file.size) : file.mimetype}
                            </Text>
                          </View>
                          
                          {/* Download button */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "h-8 w-8 rounded-lg",
                              isOwnMessage 
                                ? "hover:bg-primary-foreground/20" 
                                : "hover:bg-muted"
                            )}
                            onPress={() => Linking.openURL(file.file)}
                          >
                            <Icon 
                              as={Download} 
                              size={16} 
                              className={cn(
                                isOwnMessage 
                                  ? "text-primary-foreground/80" 
                                  : "text-muted-foreground"
                              )}
                            />
                          </Button>
                        </CardContent>
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Timestamp for own messages */}
          {isOwnMessage && (
            <Text className="text-xs text-muted-foreground mt-1 text-right">
              {formatDate(message.created)}
            </Text>
          )}
        </View>

        {/* Own message avatar - on the right */}
        {isOwnMessage && (
          <TouchableOpacity 
            onPress={() => onUserPress?.(currentUser!)} 
            className="w-8 h-8 rounded-full overflow-hidden mt-1 flex-shrink-0"
            activeOpacity={0.7}
          >
            {currentUser?.avatar ? (
              <Image 
                source={{ uri: currentUser.avatar }} 
                className="w-full h-full" 
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-primary items-center justify-center">
                <Text className="text-sm font-semibold text-primary-foreground">
                  {currentUser?.get_full_name?.charAt(0).toUpperCase() || 'Y'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};