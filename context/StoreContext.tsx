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

  const seedDatabase = async () => {
    console.log("Seeding database...");
    
    // 1. Mathematics
    const mathId = crypto.randomUUID();
    await db.addSubject({ id: mathId, name: 'Mathematics', icon: 'calculator', color: 'blue', createdAt: Date.now() });
    
    const algebraId = crypto.randomUUID();
    await db.addChapter({ id: algebraId, subjectId: mathId, title: 'Algebra Basics', createdAt: Date.now() });
    await db.addNote({ 
        id: crypto.randomUUID(), 
        chapterId: algebraId, 
        title: 'Linear Equations', 
        content: '# Linear Equations\n\nA linear equation is an equation that may be put in the form $ax + b = 0$, where $a$ and $b$ are constants.\n\n* **Slope-Intercept Form:** $y = mx + b$\n* **Standard Form:** $Ax + By = C$', 
        type: 'formula', 
        createdAt: Date.now() 
    });

    // 2. Computer Science
    const csId = crypto.randomUUID();
    await db.addSubject({ id: csId, name: 'Computer Science', icon: 'code', color: 'purple', createdAt: Date.now() });
    
    const reactId = crypto.randomUUID();
    await db.addChapter({ id: reactId, subjectId: csId, title: 'React Hooks', createdAt: Date.now() });
    await db.addNote({
        id: crypto.randomUUID(),
        chapterId: reactId,
        title: 'useEffect Explained',
        content: '# useEffect Hook\n\n`useEffect` is a React Hook that lets you synchronize a component with an external system.\n\n```javascript\nuseEffect(() => {\n  const connection = createConnection(serverUrl, roomId);\n  connection.connect();\n  return () => {\n    connection.disconnect();\n  };\n}, [serverUrl, roomId]);\n```',
        type: 'eli5',
        createdAt: Date.now()
    });

    // 3. History
    const histId = crypto.randomUUID();
    await db.addSubject({ id: histId, name: 'History', icon: 'landmark', color: 'orange', createdAt: Date.now() });
    await db.addChapter({ id: crypto.randomUUID(), subjectId: histId, title: 'The Renaissance', createdAt: Date.now() });
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const allSubjects = await db.getSubjects();
      
      // Auto-seed if empty
      if (allSubjects.length === 0) {
          await seedDatabase();
          const seededSubjects = await db.getSubjects();
          setSubjects(seededSubjects);
          
          // Load chapters for seeded subjects
          const chapMap: Record<string, Chapter[]> = {};
          for (const s of seededSubjects) {
            chapMap[s.id] = await db.getChapters(s.id);
          }
          setChapters(chapMap);
      } else {
          setSubjects(allSubjects);
          const chapMap: Record<string, Chapter[]> = {};
          for (const s of allSubjects) {
            chapMap[s.id] = await db.getChapters(s.id);
          }
          setChapters(chapMap);
      }

      setQuizzes(await db.getQuizzes());
      setChats(await db.getChats());
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initDB().then(() => refreshData());
  }, []);

  const addSubject = async (name: string, icon: string, color: string) => {
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name,
      icon,
      color,
      createdAt: Date.now(),
    };
    await db.addSubject(newSubject);
    await refreshData();
  };

  const deleteSubject = async (id: string) => {
    await db.deleteSubject(id);
    await refreshData();
  };

  const addChapter = async (subjectId: string, title: string) => {
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      subjectId,
      title,
      createdAt: Date.now(),
    };
    await db.addChapter(newChapter);
    await refreshData();
    return newChapter.id;
  };

  const addNote = async (note: Note) => {
    await db.addNote(note);
    // No full refresh needed for notes usually, but for simplicity
  };

  const addQuiz = async (quiz: Quiz) => {
    await db.addQuiz(quiz);
    setQuizzes(await db.getQuizzes());
  };

  const saveQuizResult = async (result: QuizResult) => {
    await db.saveResult(result);
  };

  // Chat
  const createChat = async (title: string) => {
    const id = crypto.randomUUID();
    const session: ChatSession = { id, title, updatedAt: Date.now() };
    await db.createChat(session);
    setChats(await db.getChats());
    return id;
  };

  const getChatMessages = async (id: string) => {
    return db.getMessages(id);
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
      subjects,
      chapters,
      quizzes,
      loading,
      refreshData,
      addSubject,
      deleteSubject,
      addChapter,
      addNote,
      addQuiz,
      saveQuizResult,
      chats,
      createChat,
      getChatMessages,
      sendChatMessage
    }}>
      {children}
    </StoreContext.Provider>
  );
};