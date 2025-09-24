import React, { useState, useRef, useEffect } from 'react';
import { View, Pressable, Animated, TextInput, ScrollView } from 'react-native';
import { Text } from './text';
import { Icon } from './icon';
import { cn } from '@/lib/utils';
import { SearchIcon, XIcon, ClockIcon } from 'lucide-react-native';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'category';
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

const mockSuggestions: SearchSuggestion[] = [
  { id: '1', text: 'road repair', type: 'recent' },
  { id: '2', text: 'water supply', type: 'recent' },
  { id: '3', text: 'corruption', type: 'trending' },
  { id: '4', text: 'electricity', type: 'recent' },
  { id: '5', text: 'garbage collection', type: 'trending' },
  { id: '6', text: 'traffic signal', type: 'recent' },
  { id: '7', text: 'bribe', type: 'trending' },
  { id: '8', text: 'municipal office', type: 'category' },
  { id: '9', text: 'potholes', type: 'trending' },
  { id: '10', text: 'power cut', type: 'recent' },
];

export function SearchBar({ onSearch, onFocus, onBlur, className }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchAnim = useRef(new Animated.Value(0)).current;
  const suggestionsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.parallel([
        Animated.spring(searchAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(suggestionsAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(searchAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(suggestionsAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused]);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions(mockSuggestions.slice(0, 5));
    }
  }, [query]);

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
    onBlur?.();
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    onSearch(suggestion.text);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  const searchScale = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  const suggestionsOpacity = suggestionsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const suggestionsTranslateY = suggestionsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  return (
    <View className={cn("relative", className)}>
      {/* Search Input */}
      <Animated.View
        className={cn(
          "flex-row items-center bg-muted rounded-full px-4 py-2 border",
          isFocused && "border-primary bg-background"
        )}
        style={{ transform: [{ scale: searchScale }] }}
      >
        <Icon as={SearchIcon} size={20} className="text-muted-foreground mr-3" />
        <TextInput
          className="flex-1 text-base text-foreground"
          placeholder="Search civic issues..."
          placeholderTextColor="#8E8E93"
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={() => handleSearch(query)}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={clearSearch} className="ml-2">
            <Icon as={XIcon} size={18} className="text-muted-foreground" />
          </Pressable>
        )}
      </Animated.View>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Animated.View
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-[100] max-h-60"
          style={{
            opacity: suggestionsOpacity,
            transform: [{ translateY: suggestionsTranslateY }],
          }}
        >
          <ScrollView className="max-h-60">
            <View className="p-2">
              {suggestions.map((suggestion, index) => (
                <Pressable
                  key={suggestion.id}
                  onPress={() => handleSuggestionPress(suggestion)}
                  className={cn(
                    "flex-row items-center px-3 py-2 rounded-md",
                    index === suggestions.length - 1 ? "" : "border-b border-border"
                  )}
                >
                  <Icon
                    as={suggestion.type === 'recent' ? ClockIcon : SearchIcon}
                    size={16}
                    className={cn(
                      "mr-3",
                      suggestion.type === 'trending' ? "text-orange-500" :
                      suggestion.type === 'category' ? "text-blue-500" :
                      "text-muted-foreground"
                    )}
                  />
                  <Text className="flex-1 text-sm text-foreground">
                    {suggestion.text}
                  </Text>
                  {suggestion.type === 'trending' && (
                    <View className="bg-orange-100 px-2 py-1 rounded-full">
                      <Text className="text-xs text-orange-600 font-medium">Trending</Text>
                    </View>
                  )}
                  {suggestion.type === 'category' && (
                    <View className="bg-blue-100 px-2 py-1 rounded-full">
                      <Text className="text-xs text-blue-600 font-medium">Category</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}
