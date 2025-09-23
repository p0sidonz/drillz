import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { PostCard, Post } from '@/components/ui/post';
import { PostDetail } from '@/components/ui/post-detail';
import { Sidebar } from '@/components/ui/sidebar';
import { MenuIcon } from 'lucide-react-native';

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'concerned_citizen',
    subreddit: 'infrastructure',
    title: 'This road has been in terrible condition for 6 months!',
    content: 'The potholes on Main Street are getting worse every day. My car suspension is completely damaged. The municipality keeps promising repairs but nothing happens. How much longer do we have to suffer?',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
    upvotes: 234,
    comments: 45,
    time: '2h',
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false,
  },
  {
    id: '2',
    author: 'taxpayer_angry',
    subreddit: 'corruption',
    title: 'Government officer openly demanded bribe for my license',
    content: 'Went to get my driving license renewed. The officer straight up asked for ₹2000 "processing fee" in cash. When I refused, he made me wait 3 hours and then said "come tomorrow". This is daylight robbery!',
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400',
    upvotes: 189,
    comments: 32,
    time: '4h',
    isUpvoted: true,
    isDownvoted: false,
    isBookmarked: true,
  },
  {
    id: '3',
    author: 'water_crisis',
    subreddit: 'utilities',
    title: 'No water supply for 5 days straight!',
    content: 'Our entire area has been without water for almost a week. The water department says "pipeline repair" but no work is being done. We have to buy water from tankers at ₹50 per bucket. This is basic human right!',
    upvotes: 156,
    comments: 28,
    time: '6h',
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false,
  },
  {
    id: '4',
    author: 'power_cut_victim',
    subreddit: 'electricity',
    title: 'Power cuts every day for 8+ hours!',
    content: 'The electricity department is doing planned maintenance every single day. No prior notice, no schedule. My work from home is completely disrupted. The bill comes on time though! Where is our money going?',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
    upvotes: 312,
    comments: 67,
    time: '8h',
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false,
  },
  {
    id: '5',
    author: 'garbage_problem',
    subreddit: 'sanitation',
    title: 'Garbage collection stopped for 2 weeks!',
    content: 'The entire street is filled with garbage. The municipal workers are on strike but the contractor is still getting paid. Meanwhile, we are suffering from health issues due to the stench and flies everywhere.',
    upvotes: 98,
    comments: 23,
    time: '12h',
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false,
  },
  {
    id: '6',
    author: 'traffic_mess',
    subreddit: 'transport',
    title: 'Traffic signal not working for 3 days!',
    content: 'The main intersection near the market has no working traffic light. Cars are honking non-stop, accidents happening every hour. Called the traffic police 10 times, they say "we will look into it". When will they actually do something?',
    upvotes: 145,
    comments: 34,
    time: '1d',
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false,
  },
];

const mockComments = [
  {
    id: '1',
    author: 'fellow_victim',
    content: 'Same issue in our area! The road has been like this for 8 months. I\'ve complained to the municipal office 15 times. They just keep saying "work in progress" but nothing happens.',
    time: '1h',
    upvotes: 12,
    replies: [
      {
        id: '1-1',
        author: 'concerned_citizen',
        content: 'Exactly! They have the same excuse everywhere. "Work in progress" but no workers visible. It\'s all a scam to keep the budget money.',
        time: '45m',
        upvotes: 8,
      }
    ]
  },
  {
    id: '2',
    author: 'local_resident',
    content: 'I had to pay ₹5000 bribe for my property tax clearance. The officer said "this is how it works here". When I asked for receipt, he got angry and made me wait 2 more days.',
    time: '2h',
    upvotes: 15,
  },
  {
    id: '3',
    author: 'angry_taxpayer',
    content: 'This is why our country is not developing. Corruption at every level. We pay taxes but get no services. When will this change?',
    time: '3h',
    upvotes: 9,
    replies: [
      {
        id: '3-1',
        author: 'concerned_citizen',
        content: 'We need to start recording these incidents and posting them online. Social media pressure is the only thing that works these days.',
        time: '2h',
        upvotes: 6,
      },
      {
        id: '3-2',
        author: 'veteran_activist',
        content: 'File RTI applications. They hate RTI because it exposes their corruption. I\'ve filed 20 RTIs and got results in 5 cases.',
        time: '1h',
        upvotes: 4,
      }
    ]
  }
];

export default function HomeScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
  };

  const handleUpvote = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, upvotes: post.upvotes + (post.isUpvoted ? -1 : 1), isUpvoted: !post.isUpvoted, isDownvoted: false }
        : post
    ));
  };

  const handleDownvote = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, upvotes: post.upvotes - (post.isDownvoted ? 1 : 1), isDownvoted: !post.isDownvoted, isUpvoted: false }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleAddComment = (postId: string, content: string) => {
    // In a real app, this would add to the backend
    console.log('Adding comment:', { postId, content });
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Text className="text-lg font-semibold">r/civicissues</Text>
        <Button
          size="sm"
          variant="ghost"
          onPress={() => setSidebarOpen(true)}
          className="h-8 w-8 p-0"
        >
          <Icon as={MenuIcon} size={20} />
        </Button>
      </View>

      {/* Posts Feed */}
      <ScrollView className="flex-1">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPress={handlePostPress}
            onUpvote={handleUpvote}
            onDownvote={handleDownvote}
            onBookmark={handleBookmark}
          />
        ))}
      </ScrollView>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab="home"
        onTabPress={(tab) => {
          // Handle tab navigation
          console.log('Navigate to:', tab);
        }}
      />

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          comments={mockComments}
          isVisible={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpvote={handleUpvote}
          onDownvote={handleDownvote}
          onBookmark={handleBookmark}
          onAddComment={handleAddComment}
        />
      )}
    </View>
  );
}