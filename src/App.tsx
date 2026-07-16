/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Member, Session, Visitor, DriveFile } from './types';
import { 
  initialMembers, 
  initialSessions, 
  initialVisitors, 
  initialDriveFiles, 
  getStoredData, 
  setStoredData 
} from './data';

import LoginScreen from './components/LoginScreen';
import ParvisScreen from './components/ParvisScreen';
import MembersList from './components/MembersList';
import SessionsList from './components/SessionsList';
import VisitorsList from './components/VisitorsList';
import LibraryViewer from './components/LibraryViewer';
import TreasuryScreen from './components/TreasuryScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [currentView, setCurrentView] = useState<string>('parvis');

  // Load from local storage or pre-seeded data for complete persistence
  const [members, setMembers] = useState<Member[]>(() => 
    getStoredData<Member[]>('lodge_members', initialMembers)
  );
  const [sessions, setSessions] = useState<Session[]>(() => 
    getStoredData<Session[]>('lodge_sessions', initialSessions)
  );
  const [visitors, setVisitors] = useState<Visitor[]>(() => 
    getStoredData<Visitor[]>('lodge_visitors', initialVisitors)
  );
  const [driveFiles] = useState<DriveFile[]>(initialDriveFiles);

  // Sync state changes to local storage
  useEffect(() => {
    setStoredData('lodge_members', members);
  }, [members]);

  useEffect(() => {
    setStoredData('lodge_sessions', sessions);
  }, [sessions]);

  useEffect(() => {
    setStoredData('lodge_visitors', visitors);
  }, [visitors]);

  // Keep current user updated if they modify their own profile
  useEffect(() => {
    if (currentUser) {
      const updatedUser = members.find(m => m.id === currentUser.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    }
  }, [members]);

  // Member actions
  const handleAddMember = (newMember: Member) => {
    setMembers(prev => [...prev, newMember]);
  };

  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const handleDeleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  // Session actions
  const handleAddSession = (newSession: Session) => {
    setSessions(prev => [newSession, ...prev]);
  };

  const handleUpdateSession = (updatedSession: Session) => {
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  // Visitor actions
  const handleAddVisitor = (newVisitor: Visitor) => {
    setVisitors(prev => [...prev, newVisitor]);
  };

  const handleUpdateVisitor = (updatedVisitor: Visitor) => {
    setVisitors(prev => prev.map(v => v.id === updatedVisitor.id ? updatedVisitor : v));
  };

  const handleDeleteVisitor = (id: string) => {
    setVisitors(prev => prev.filter(v => v.id !== id));
  };

  const handleLoginSuccess = (user: Member) => {
    setCurrentUser(user);
    setCurrentView('parvis');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('parvis');
  };

  // Render proper screen view based on current state
  if (!currentUser) {
    return <LoginScreen members={members} onLoginSuccess={handleLoginSuccess} />;
  }

  switch (currentView) {
    case 'parvis':
      return (
        <ParvisScreen 
          currentUser={currentUser} 
          members={members}
          sessions={sessions}
          onLogout={handleLogout} 
          onNavigate={setCurrentView} 
        />
      );
    case 'membres':
      return (
        <MembersList
          currentUser={currentUser}
          members={members}
          onAddMember={handleAddMember}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
          onBack={() => setCurrentView('parvis')}
        />
      );
    case 'tenues':
      return (
        <SessionsList
          currentUser={currentUser}
          sessions={sessions}
          members={members}
          visitors={visitors}
          onAddSession={handleAddSession}
          onUpdateSession={handleUpdateSession}
          onDeleteSession={handleDeleteSession}
          onBack={() => setCurrentView('parvis')}
        />
      );
    case 'visiteurs':
      return (
        <VisitorsList
          currentUser={currentUser}
          visitors={visitors}
          onAddVisitor={handleAddVisitor}
          onUpdateVisitor={handleUpdateVisitor}
          onDeleteVisitor={handleDeleteVisitor}
          onBack={() => setCurrentView('parvis')}
        />
      );
    case 'architecture':
      return (
        <LibraryViewer
          currentUser={currentUser}
          driveFiles={driveFiles}
          type="Architecture"
          onBack={() => setCurrentView('parvis')}
        />
      );
    case 'instructions':
      return (
        <LibraryViewer
          currentUser={currentUser}
          driveFiles={driveFiles}
          type="Instructions"
          onBack={() => setCurrentView('parvis')}
        />
      );
    case 'rituels':
      return (
        <LibraryViewer
          currentUser={currentUser}
          driveFiles={driveFiles}
          type="Rituels"
          onBack={() => setCurrentView('parvis')}
        />
      );
    case 'tresorerie':
      return (
        <TreasuryScreen
          currentUser={currentUser}
          members={members}
          sessions={sessions}
          onUpdateMember={handleUpdateMember}
          onBack={() => setCurrentView('parvis')}
        />
      );
    default:
      return (
        <ParvisScreen 
          currentUser={currentUser} 
          members={members}
          sessions={sessions}
          onLogout={handleLogout} 
          onNavigate={setCurrentView} 
        />
      );
  }
}
