import React, { useState } from 'react';
import { View, ScrollView, Image, Pressable } from 'react-native';
import { Text } from './text';
import { Button } from './button';
import { Icon } from './icon';
import { Avatar } from './avatar';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MessageCircleIcon, 
  ShareIcon, 
  BookmarkIcon,
  XIcon,
  HeartIcon,
  ReplyIcon
} from 'lucide-react-native';
import { Post, Comment } from './post';

interface PostDetailProps {
  post: Post;
  comments: Comment[];
  isVisible: boolean;
  onClose: () => void;
  onUpvote: (postId: string) => void;
  onDownvote: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
}

export function PostDetail({ 
  post, 
  comments, 
  isVisible, 
  onClose, 
  onUpvote, 
  onDownvote, 
  onBookmark,
  onAddComment 
}: PostDetailProps) {
  const [newComment, setNewComment] = useState('');
  const [isUpvoted, setIsUpvoted] = useState(post.isUpvoted || false);
  const [isDownvoted, setIsDownvoted] = useState(post.isDownvoted || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);

  if (!isVisible) return null;

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

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(post.id, newComment.trim());
      setNewComment('');
    }
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <View key={comment.id} className={cn("mb-3", depth > 0 && "ml-4")}>
      <View className="flex-row gap-2 mb-1">
        <Avatar className="w-6 h-6">
          <Text className="text-xs font-bold">
            {comment.author.charAt(0).toUpperCase()}
          </Text>
        </Avatar>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-xs font-medium">u/{comment.author}</Text>
            <Text className="text-xs text-muted-foreground">{comment.time}</Text>
          </View>
          <Text className="text-sm leading-5 mb-2">{comment.content}</Text>
          <View className="flex-row items-center gap-3">
            <Button size="sm" variant="ghost" className="h-6 px-2">
              <Icon as={ArrowUpIcon} size={12} className="text-muted-foreground" />
            </Button>
            <Text className="text-xs text-muted-foreground">{comment.upvotes}</Text>
            <Button size="sm" variant="ghost" className="h-6 px-2">
              <Icon as={ArrowDownIcon} size={12} className="text-muted-foreground" />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2">
              <Icon as={ReplyIcon} size={12} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground ml-1">Reply</Text>
            </Button>
          </View>
        </View>
      </View>
      {comment.replies?.map(reply => renderComment(reply, depth + 1))}
    </View>
  );

  return (
    <View className="absolute inset-0 z-50 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Text className="text-lg font-semibold">Post Details</Text>
        <Button size="sm" variant="ghost" onPress={onClose}>
          <Icon as={XIcon} size={20} />
        </Button>
      </View>

      <ScrollView className="flex-1">
        {/* Post Content */}
        <View className="p-4 border-b border-border">
          <View className="flex-row items-center gap-2 mb-3">
            <Avatar className="w-8 h-8">
              <Text className="text-sm font-bold">
                {post.author.charAt(0).toUpperCase()}
              </Text>
            </Avatar>
            <View className="flex-1">
              <Text className="text-sm font-medium">u/{post.author}</Text>
              <Text className="text-xs text-muted-foreground">
                r/{post.subreddit} • {post.time}
              </Text>
            </View>
          </View>

          <Text className="text-lg font-semibold mb-3 leading-6">
            {post.title}
          </Text>

          {post.content && (
            <Text className="text-base text-muted-foreground mb-4 leading-6">
              {post.content}
            </Text>
          )}

          {post.image && (
            <View className="mb-4 rounded-lg overflow-hidden">
              <Image 
                source={{ uri: post.image }} 
                className="w-full h-64"
                resizeMode="cover"
              />
            </View>
          )}

          {/* Post Actions */}
          <View className="flex-row items-center gap-4">
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
              <Text className="text-sm font-medium min-w-[20px] text-center">
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

            <Button
              size="sm"
              variant="ghost"
              className="flex-row items-center gap-1 h-8"
            >
              <Icon as={MessageCircleIcon} size={16} className="text-muted-foreground" />
              <Text className="text-sm text-muted-foreground">
                {post.comments} comments
              </Text>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <Icon as={ShareIcon} size={16} className="text-muted-foreground" />
            </Button>

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

        {/* Comments Section */}
        <View className="p-4">
          <Text className="text-lg font-semibold mb-4">
            Comments ({comments.length})
          </Text>

          {/* Add Comment */}
          <View className="flex-row gap-2 mb-4">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              className="flex-1"
            />
            <Button onPress={handleAddComment} disabled={!newComment.trim()}>
              <Text className="text-white">Post</Text>
            </Button>
          </View>

          {/* Comments List */}
          <View>
            {comments.map(comment => renderComment(comment))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
