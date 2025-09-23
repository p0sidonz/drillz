import React, { useState } from 'react';
import { View, Pressable, Image } from 'react-native';
import { Text } from './text';
import { Button } from './button';
import { Icon } from './icon';
import { Avatar } from './avatar';
import { cn } from '@/lib/utils';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MessageCircleIcon, 
  ShareIcon, 
  BookmarkIcon,
  MoreHorizontalIcon,
  HeartIcon
} from 'lucide-react-native';

interface Comment {
  id: string;
  author: string;
  content: string;
  time: string;
  upvotes: number;
  replies?: Comment[];
}

interface Post {
  id: string;
  author: string;
  subreddit: string;
  title: string;
  content: string;
  image?: string;
  upvotes: number;
  comments: number;
  time: string;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
  isBookmarked?: boolean;
}

interface PostProps {
  post: Post;
  onPress: (post: Post) => void;
  onUpvote: (postId: string) => void;
  onDownvote: (postId: string) => void;
  onBookmark: (postId: string) => void;
}

export function PostCard({ post, onPress, onUpvote, onDownvote, onBookmark }: PostProps) {
  const [isUpvoted, setIsUpvoted] = useState(post.isUpvoted || false);
  const [isDownvoted, setIsDownvoted] = useState(post.isDownvoted || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);

  const handleUpvote = () => {
    if (isDownvoted) {
      setIsDownvoted(false);
    }
    setIsUpvoted(!isUpvoted);
    onUpvote(post.id);
  };

  const handleDownvote = () => {
    if (isUpvoted) {
      setIsUpvoted(false);
    }
    setIsDownvoted(!isDownvoted);
    onDownvote(post.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark(post.id);
  };

  return (
    <Pressable 
      onPress={() => onPress(post)}
      className="bg-background border-b border-border"
    >
      <View className="p-3">
        {/* Header */}
        <View className="flex-row items-center gap-2 mb-2">
          <Avatar className="w-6 h-6">
            <Text className="text-xs font-bold">
              {post.author.charAt(0).toUpperCase()}
            </Text>
          </Avatar>
          <Text className="text-xs text-muted-foreground">
            r/{post.subreddit} • u/{post.author} • {post.time}
          </Text>
          <View className="ml-auto">
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Icon as={MoreHorizontalIcon} size={14} />
            </Button>
          </View>
        </View>

        {/* Title */}
        <Text className="text-base font-medium mb-2 leading-5">
          {post.title}
        </Text>

        {/* Content */}
        {post.content && (
          <Text className="text-sm text-muted-foreground mb-3 leading-5">
            {post.content}
          </Text>
        )}

        {/* Image */}
        {post.image && (
          <View className="mb-3 rounded-lg overflow-hidden">
            <Image 
              source={{ uri: post.image }} 
              className="w-full h-48"
              resizeMode="cover"
            />
          </View>
        )}

        {/* Actions */}
        <View className="flex-row items-center gap-4">
          {/* Upvote/Downvote */}
          <View className="flex-row items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onPress={handleUpvote}
              className={cn(
                "h-8 w-8 p-0",
                isUpvoted && "bg-orange-100"
              )}
            >
              <Icon 
                as={ArrowUpIcon} 
                size={16} 
                className={cn(
                  isUpvoted ? "text-orange-500" : "text-muted-foreground"
                )} 
              />
            </Button>
            <Text className="text-xs font-medium min-w-[20px] text-center">
              {post.upvotes + (isUpvoted ? 1 : 0) - (isDownvoted ? 1 : 0)}
            </Text>
            <Button
              size="sm"
              variant="ghost"
              onPress={handleDownvote}
              className={cn(
                "h-8 w-8 p-0",
                isDownvoted && "bg-blue-100"
              )}
            >
              <Icon 
                as={ArrowDownIcon} 
                size={16} 
                className={cn(
                  isDownvoted ? "text-blue-500" : "text-muted-foreground"
                )} 
              />
            </Button>
          </View>

          {/* Comments */}
          <Button
            size="sm"
            variant="ghost"
            onPress={() => onPress(post)}
            className="flex-row items-center gap-1 h-8"
          >
            <Icon as={MessageCircleIcon} size={16} className="text-muted-foreground" />
            <Text className="text-xs text-muted-foreground">
              {post.comments}
            </Text>
          </Button>

          {/* Share */}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <Icon as={ShareIcon} size={16} className="text-muted-foreground" />
          </Button>

          {/* Bookmark */}
          <Button
            size="sm"
            variant="ghost"
            onPress={handleBookmark}
            className={cn(
              "h-8 w-8 p-0",
              isBookmarked && "bg-yellow-100"
            )}
          >
            <Icon 
              as={BookmarkIcon} 
              size={16} 
              className={cn(
                isBookmarked ? "text-yellow-500" : "text-muted-foreground"
              )} 
            />
          </Button>
        </View>
      </View>
    </Pressable>
  );
}

export type { Post, Comment };
