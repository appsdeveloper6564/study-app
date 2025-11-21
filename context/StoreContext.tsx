import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Subject, Chapter, Quiz, Note, QuizResult, ChatSession, ChatMessage } from '../types';
import { db, initDB } from '../services/db';

interface StoreContextType {
  subjects: Subject[];
  chapters: Record<string, Chapter[]>;
  quizzes: Quiz[];
  loading: boolean;
  refreshData: () => Promise<void>;
  
  // Actions
  addSubject: (name: string, icon: string, color: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addChapter: (subjectId: string, title: string) => Promise<string>;
  addNote: (note: Note) => Promise<void>;
  addQuiz: (quiz: Quiz) => Promise<void>;
  saveQuizResult: (result: QuizResult) => Promise<void>;
  
  // Chat
  chats: ChatSession[];
  createChat: (title: string) => Promise<string>;
  getChatMessages: (id: string) => Promise<ChatMessage[]>;
  sendChatMessage: (sessionId: string, text: string, role: 'user' | 'model') => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Record<string, Chapter[]>>({});
  const [quizzes, setQuizzes] = useState<Quiz[]>([]); // Recent quizzes
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      await initDB(); // Ensure DB is ready
      const allSubjects = await db.getSubjects();
      setSubjects(allSubjects);
      
      const chapMap: Record<string, Chapter[]> = {};
      for (const sub of allSubjects) {
        chapMap[sub.id] = await db.getChapters(sub.id);
      }
      setChapters(chapMap);

      const allQuizzes = await db.getQuizzes();
      setQuizzes(allQuizzes.sort((a,b) => b.createdAt - a.createdAt));

      const allChats = await db.getChats();
      setChats(allChats.sort((a,b) => b.updatedAt - a.updatedAt));
    } catch (e) {
      console.error("Failed to load DB", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addSubject = async (name: string, icon: string, color: string) => {
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name,
      icon,
      color,
      createdAt: Date.now()
    };
    await db.addSubject(newSubject);
    await refreshData();
  };

  const deleteSubject = async (id: string) => {
    await db.deleteSubject(id);
    await refreshData();
  };

  const addChapter = async (subjectId: string, title: string) => {
    const id = crypto.randomUUID();
    await db.addChapter({
      id,
      subjectId,
      title,
      createdAt: Date.now()
    });
    await refreshData();
    return id;
  };

  const addNote = async (note: Note) => {
    await db.addNote(note);
    // No need to full refresh usually, but keeps it simple
    await refreshData();
  };

  const addQuiz = async (quiz: Quiz) => {
    await db.addQuiz(quiz);
    await refreshData();
  };

  const saveQuizResult = async (result: QuizResult) => {
    await db.saveResult(result);
  };

  const createChat = async (title: string) => {
    const id = crypto.randomUUID();
    await db.createChat({ id, title, updatedAt: Date.now() });
    setChats(prev => [{ id, title, updatedAt: Date.now() }, ...prev]);
    return id;
  };

  const getChatMessages = async (sessionId: string) => {
    return await db.getMessages(sessionId);
  };

  const sendChatMessage = async (sessionId: string, text: string, role: 'user' | 'model') => {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role,
      text,
      timestamp: Date.now()
    };
    await db.addMessage(sessionId, msg);
  };

  return (
    <StoreContext.Provider value={{ 
      subjects, chapters, quizzes, loading, refreshData,
      addSubject, deleteSubject, addChapter, addNote, addQuiz, saveQuizResult,
      chats, createChat, getChatMessages, sendChatMessage
    }}>
      {children}
    </StoreContext.Provider>
  );
};