import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PlusIcon, SaveIcon } from 'lucide-react-native';

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    
    setIsCreating(true);
    // TODO: Implement drill creation logic
    console.log('Creating drill:', { title, description });
    
    // Simulate API call
    setTimeout(() => {
      setIsCreating(false);
      setTitle('');
      setDescription('');
    }, 1000);
  };

  return (
    <ScrollView className="flex-1 bg-background">
        <View className="p-4">

     
        </View>
      </ScrollView>
  );
}
