import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Subject, Chapter, Note, Quiz, QuizResult, ChatSession, ChatMessage, AppSettings, BackupData } from '../types';

interface AIStudyDB extends DBSchema {
  subjects: {
    key: string;
    value: Subject;
  };
  chapters: {
    key: string;
    value: Chapter;
    indexes: { 'by-subject': string };
  };
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-chapter': string };
  };
  quizzes: {
    key: string;
    value: Quiz;
    indexes: { 'by-chapter': string };
  };
  results: {
    key: string;
    value: QuizResult;
    indexes: { 'by-quiz': string };
  };
  chats: {
    key: string;
    value: ChatSession;
  };
  messages: {
    key: string;
    value: ChatMessage & { sessionId: string };
    indexes: { 'by-session': string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

const DB_NAME = 'ai_study_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AIStudyDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<AIStudyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('subjects', { keyPath: 'id' });
        
        const chapterStore = db.createObjectStore('chapters', { keyPath: 'id' });
        chapterStore.createIndex('by-subject', 'subjectId');
        
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('by-chapter', 'chapterId');
        
        const quizStore = db.createObjectStore('quizzes', { keyPath: 'id' });
        quizStore.createIndex('by-chapter', 'chapterId');
        
        const resultStore = db.createObjectStore('results', { keyPath: 'id' });
        resultStore.createIndex('by-quiz', 'quizId');

        db.createObjectStore('chats', { keyPath: 'id' });
        
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('by-session', 'sessionId');

        db.createObjectStore('settings', { keyPath: 'username' }); // simplified key
      },
    });
  }
  return dbPromise;
};

export const db = {
  async getSubjects() {
    return (await initDB()).getAll('subjects');
  },
  async addSubject(subject: Subject) {
    return (await initDB()).put('subjects', subject);
  },
  async deleteSubject(id: string) {
    const db = await initDB();
    // Cascade delete (simple implementation)
    const tx = db.transaction(['subjects', 'chapters', 'notes', 'quizzes'], 'readwrite');
    await tx.objectStore('subjects').delete(id);
    // In a real app, we'd query and delete children. For now, simplistic delete.
    await tx.done;
  },
  
  async getChapter(id: string) {
    return (await initDB()).get('chapters', id);
  },
  async getChapters(subjectId: string) {
    return (await initDB()).getAllFromIndex('chapters', 'by-subject', subjectId);
  },
  async addChapter(chapter: Chapter) {
    return (await initDB()).put('chapters', chapter);
  },

  async getNotes(chapterId: string) {
    return (await initDB()).getAllFromIndex('notes', 'by-chapter', chapterId);
  },
  async addNote(note: Note) {
    return (await initDB()).put('notes', note);
  },
  async deleteNote(id: string) {
    return (await initDB()).delete('notes', id);
  },

  async getQuizzes(chapterId?: string) {
    if (chapterId) {
      return (await initDB()).getAllFromIndex('quizzes', 'by-chapter', chapterId);
    }
    return (await initDB()).getAll('quizzes');
  },
  async addQuiz(quiz: Quiz) {
    return (await initDB()).put('quizzes', quiz);
  },
  async deleteQuiz(id: string) {
    return (await initDB()).delete('quizzes', id);
  },

  async saveResult(result: QuizResult) {
    return (await initDB()).put('results', result);
  },

  async getChats() {
    return (await initDB()).getAll('chats');
  },
  async createChat(session: ChatSession) {
    return (await initDB()).put('chats', session);
  },
  async getMessages(sessionId: string) {
    return (await initDB()).getAllFromIndex('messages', 'by-session', sessionId);
  },
  async addMessage(sessionId: string, message: ChatMessage) {
    return (await initDB()).put('messages', { ...message, sessionId });
  },
  async deleteChat(sessionId: string) {
    return (await initDB()).delete('chats', sessionId);
  },

  async exportBackup(): Promise<string> {
    const db = await initDB();
    const backup: BackupData = {
      version: 1,
      timestamp: Date.now(),
      subjects: await db.getAll('subjects'),
      chapters: await db.getAll('chapters'),
      notes: await db.getAll('notes'),
      quizzes: await db.getAll('quizzes'),
      results: await db.getAll('results'),
      chats: await db.getAll('chats'),
      messages: {},
    };

    const messages = await db.getAll('messages');
    // Group messages by session manually for cleaner JSON
    messages.forEach(m => {
        if(!backup.messages[m.sessionId]) backup.messages[m.sessionId] = [];
        backup.messages[m.sessionId].push(m);
    });

    return JSON.stringify(backup);
  },

  async importBackup(json: string) {
    const data: BackupData = JSON.parse(json);
    const db = await initDB();
    const tx = db.transaction(['subjects', 'chapters', 'notes', 'quizzes', 'results', 'chats', 'messages'], 'readwrite');
    
    // Clear existing - optional, but safer for restore
    // await Promise.all([
    //   tx.objectStore('subjects').clear(),
    //   // ... others
    // ]);

    for (const s of data.subjects) await tx.objectStore('subjects').put(s);
    for (const c of data.chapters) await tx.objectStore('chapters').put(c);
    for (const n of data.notes) await tx.objectStore('notes').put(n);
    for (const q of data.quizzes) await tx.objectStore('quizzes').put(q);
    for (const r of data.results) await tx.objectStore('results').put(r);
    for (const c of data.chats) await tx.objectStore('chats').put(c);
    
    for (const sessionId in data.messages) {
        for (const m of data.messages[sessionId]) {
             await tx.objectStore('messages').put({ ...m, sessionId });
        }
    }
    
    await tx.done;
  }
};