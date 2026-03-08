import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Response {
  id: number;
  text: string;
  user: string;
}

interface Question {
  id: number;
  question: string;
  responses: Response[];
}

interface QuestionCardProps {
  question: Question;
}

const AskQuestionScreen: React.FC = () => {
  const [questionText, setQuestionText] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      question: "What do you think about my Work in the last 6 months?",
      responses: [
        {
          id: 1,
          text: "I think you need to improve on the data representation logic part rather than presentation",
          user: "anonymous2817"
        },
        {
          id: 2,
          text: "I feel you are more suitable for people management roles. Try applying into them",
          user: "anonymous265"
        },
        {
          id: 3,
          text: "Always upskill your talent as your Tableau skills are not upto the mark",
          user: "anonymous065"
        }
      ]
    },
    {
      id: 2,
      question: "Am I loud when I'm drunk?",
      responses: [
        {
          id: 1,
          text: "hahaha... yes",
          user: "anonymous2817"
        },
        {
          id: 2,
          text: "Man, your laughter lights up the party. Keep it going",
          user: "anonymous265"
        },
        {
          id: 3,
          text: "Who cares just be yourself",
          user: "anonymous065"
        }
      ]
    }
  ]);

  const handleSendQuestion = (): void => {
    if (questionText.trim()) {
      const newQuestion: Question = {
        id: questions.length + 1,
        question: questionText,
        responses: []
      };
      setQuestions([newQuestion, ...questions]);
      setQuestionText('');
    }
  };

  const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => (
    <View style={styles.questionCard}>
      <Text style={styles.questionText}>{question.question}</Text>
      
      {question.responses.map((response: Response) => (
        <View key={response.id} style={styles.responseContainer}>
          <Text style={styles.responseText}>{response.text}</Text>
          <Text style={styles.anonymousUser}>{response.user}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ask a Question</Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask a question to your Sapien group and get individual responses"
            placeholderTextColor="#9ca3af"
            value={questionText}
            onChangeText={setQuestionText}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSendQuestion}
            disabled={!questionText.trim()}
          >
            <Ionicons 
              name="send" 
              size={18} 
              color={questionText.trim() ? "#000" : "#9ca3af"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Questions List */}
      <ScrollView style={styles.questionsContainer} showsVerticalScrollIndicator={false}>
        {questions.map((question: Question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 20,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
    marginBottom: -4,
  },
  questionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 22,
  },
  responseContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
  },
  responseText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 4,
  },
  anonymousUser: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default AskQuestionScreen;