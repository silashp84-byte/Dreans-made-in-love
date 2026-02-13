
import React, { useState, useEffect, useCallback } from 'react';
import { DreamEntry, AppMode, Prompt, ToolType, ApiResponse, SimulatedUser } from './types';
import { loadDreamEntries, saveDreamEntries, loadFollowedUsers, saveFollowedUsers } from './services/localStorageService';
import {
  // PREDEFINED_PROMPTS, // Still needed for structure, but content from locales
} from './constants'; // Still import constants for model names etc.
import DreamscapeBackground from './components/DreamscapeBackground';
import Button from './components/Button';
import EntryCard from './components/EntryCard';
import CreateEntryForm from './components/CreateEntryForm';
import EntryDetail from './components/EntryDetail';
import Modal from './components/Modal';
import LoadingSpinner from './components/LoadingSpinner';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import { interpretDream, generateStorySpark, generateImageVisualizer, handleApiKeySelection, checkApiKeyStatus } from './services/geminiService';
import { useLocale } from './context/LocaleContext'; // Import useLocale hook
import LanguageSelectorModal from './components/LanguageSelectorModal';
import InviteFriendModal from './components/InviteFriendModal';
import FindNearbyUsersModal from './components/FindNearbyUsersModal';
import SimulatedUserProfileModal from './components/SimulatedUserProfileModal';
import MyConnectionsModal from './components/MyConnectionsModal'; // Import new modal

const App: React.FC = () => {
  const { locale, setLocale, t } = useLocale(); // Use the locale hook
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [currentMode, setCurrentMode] = useState<AppMode>('list');
  const [selectedEntry, setSelectedEntry] = useState<DreamEntry | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null); // Initialize with null, set in useEffect
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isFindNearbyUsersModalOpen, setIsFindNearbyUsersModalOpen] = useState(false);
  const [isMyConnectionsModalOpen, setIsMyConnectionsModalOpen] = useState(false); // New state for MyConnections modal
  const [selectedSimulatedUser, setSelectedSimulatedUser] = useState<SimulatedUser | null>(null);
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set()); // New state for followed users

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');
  const [aiImageResult, setAiImageResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiToolTitle, setAiToolTitle] = useState<string>('');

  // API Key state for image generation (which explicitly requires user selection)
  const [apiKeyRequiredMessage, setApiKeyRequiredMessage] = useState<string | null>(null);

  // Initialize: Load entries, check language preference, set online status, load followed users
  useEffect(() => {
    setEntries(loadDreamEntries());
    setFollowedUserIds(loadFollowedUsers()); // Load followed users

    if (!localStorage.getItem('dreamWeaverLocale')) {
      setShowLanguageSelector(true);
    } else {
      setShowLanguageSelector(false);
    }

    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Initialize random prompt after translations are loaded
  useEffect(() => {
    // Check if a known translation key is not returning itself, meaning translations are loaded
    if (t('inspiration_hiddenGarden') !== 'inspiration_hiddenGarden' && !currentPrompt) {
      generateRandomPrompt();
    }
  }, [t, currentPrompt]); // Regenerate if locale changes or if currentPrompt is null after translation loads


  // Save entries whenever the 'entries' state changes
  useEffect(() => {
    saveDreamEntries(entries);
  }, [entries]);

  // Save followed users whenever the 'followedUserIds' state changes
  useEffect(() => {
    saveFollowedUsers(followedUserIds);
  }, [followedUserIds]);

  const handleLanguageSelect = useCallback((selectedLocale: string) => {
    setLocale(selectedLocale);
    localStorage.setItem('dreamWeaverLocale', selectedLocale);
    setShowLanguageSelector(false);
    // After language change, force re-evaluation of currentPrompt to get translated text
    setCurrentPrompt(null); // This will trigger the useEffect to regenerate prompt
  }, [setLocale]);

  const addOrUpdateEntry = useCallback((entry: DreamEntry) => {
    setEntries((prevEntries) => {
      const existingIndex = prevEntries.findIndex((e) => e.id === entry.id);
      if (existingIndex > -1) {
        const updatedEntries = [...prevEntries];
        updatedEntries[existingIndex] = entry;
        return updatedEntries;
      }
      return [entry, ...prevEntries];
    });
    setCurrentMode('list');
    setSelectedEntry(null);
  }, [setEntries]);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
    setCurrentMode('list');
    setSelectedEntry(null);
  }, [setEntries]);

  const openEntryDetail = useCallback((id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setSelectedEntry(entry);
      setCurrentMode('detail');
    }
  }, [entries]);

  const generateRandomPrompt = useCallback(() => {
    const translatedInspirations: Prompt[] = [
      { id: 'p1', text: t('inspiration_hiddenGarden'), type: 'text' },
      { id: 'p2', text: t('inspiration_dreamMap'), type: 'text' },
      { id: 'p3', text: t('inspiration_speakingAnimal'), type: 'text' },
      { id: 'p4', text: t('inspiration_emotionsAsColors'), type: 'text' },
      { id: 'p5', text: t('inspiration_forgottenLullaby'), type: 'text' },
      { id: 'p6', text: t('inspiration_stardustCreature'), type: 'image' },
      { id: 'p7', text: t('inspiration_futuristicCity'), type: 'image' },
      { id: 'p8', text: t('inspiration_readingNook'), type: 'image' },
    ];
    const randomIndex = Math.floor(Math.random() * translatedInspirations.length);
    setCurrentPrompt(translatedInspirations[randomIndex]);
  }, [t]);

  // Handle AI Tool triggering
  const triggerAITool = useCallback(async (entry: DreamEntry, toolType: ToolType) => {
    setAiLoading(true);
    setAiResult('');
    setAiImageResult(null);
    setAiError(null);
    setIsAiModalOpen(true);
    setApiKeyRequiredMessage(null);

    let result: ApiResponse;

    // Use translated system instructions
    const dreamInterpreterInstruction = t('systemInstruction_dreamInterpreter');
    const storySparkInstruction = t('systemInstruction_storySpark');
    const aiVisualizerInstruction = t('systemInstruction_aiVisualizer');

    const checkKeyResponse = await checkApiKeyStatus(toolType);
    // If checkKeyResponse.message is a translation key, use it directly.
    // If it's a full error string (e.g., from geminiService throwing an error directly), then translate it here.
    if (!checkKeyResponse.success) {
      setApiKeyRequiredMessage(checkKeyResponse.message);
      setAiLoading(false);
      return;
    }

    try {
      if (toolType === 'dreamInterpreter') {
        setAiToolTitle(t('aiDreamInterpretation'));
        result = await interpretDream(entry.content, entry.imageUrl, dreamInterpreterInstruction);
      } else if (toolType === 'storySpark') {
        setAiToolTitle(t('aiStorySparkTitle'));
        result = await generateStorySpark(entry.content, storySparkInstruction);
      } else if (toolType === 'aiVisualizer') {
        setAiToolTitle(t('aiVisualizerTitle'));
        const keywords = entry.tags.length > 0 ? entry.tags.join(', ') : entry.title;
        result = await generateImageVisualizer(keywords, aiVisualizerInstruction);
        if (result.success && result.data) {
          setAiImageResult(result.data);
          // This message is purely for internal success, the UI displays the image.
          // If we wanted to show a success message on the UI, it would need to be translated.
          // For now, it's just a placeholder string returned by the service.
          // setAiResult(t('imageGeneratedSuccessfully')); // If we wanted to display this
        }
      } else {
        result = { success: false, message: 'apiError_unknownTool' }; // Use translation key
      }

      if (result.success) {
        // If the service returns a specific translated string for text results, use it.
        // Otherwise, if it's a success message, we might translate it here if needed for UI.
        setAiResult(result.data);
      } else {
        // If result.message is already a translation key from the service, pass it.
        // Otherwise, it's an error string that needs a more generic translation key.
        setAiError(result.message);
        // If the message is related to API key, use that key for the dedicated prompt.
        if (result.message.includes("apiError_")) {
          setApiKeyRequiredMessage(result.message);
        }
      }
    } catch (error: any) {
      console.error("Error during AI tool call:", error);
      // Catch any unexpected JavaScript errors during the call
      setAiError('apiError_unexpected'); // Use translation key
      setApiKeyRequiredMessage('apiError_unexpected'); // Fallback in case of unknown error needing key
    } finally {
      setAiLoading(false);
    }
  }, [t]);

  const handleApiKeyPromptSelect = useCallback(async () => {
    setApiKeyRequiredMessage(null);
    const result = await handleApiKeySelection(); // This returns a translation key for its message
    if (!result.success) {
      setAiError(result.message); // This is already a translation key
    } else {
      setAiError(null);
    }
  }, []);

  const handleViewSimulatedProfile = useCallback((user: SimulatedUser) => {
    setIsFindNearbyUsersModalOpen(false); // Close find users modal
    setIsMyConnectionsModalOpen(false); // Also close connections modal if open
    setSelectedSimulatedUser(user);
  }, []);

  const handleCloseSimulatedProfile = useCallback(() => {
    setSelectedSimulatedUser(null); // Close profile modal
    // Decide which modal to reopen based on which one was open before
    // For simplicity, let's reopen the Find Nearby Users modal for now.
    // In a more complex app, you might track the previous modal.
    setIsFindNearbyUsersModalOpen(true);
  }, []);

  const toggleFollow = useCallback((userId: string) => {
    setFollowedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  // Extract keywords from current user's dreams for shared interests
  const extractCurrentUserKeywords = useCallback((): string[] => {
    const keywords = new Set<string>();
    entries.forEach(entry => {
      entry.tags.forEach(tag => keywords.add(tag.toLowerCase()));
      entry.title.split(/\s+/).forEach(word => {
        if (word.length > 2) keywords.add(word.toLowerCase());
      });
      entry.content.split(/\s+/).forEach(word => {
        if (word.length > 2) keywords.add(word.toLowerCase());
      });
    });
    return Array.from(keywords);
  }, [entries]);

  const currentUserKeywords = extractCurrentUserKeywords();

  const renderContent = () => {
    const translatedMoods = ['Happy', 'Calm', 'Anxious', 'Excited', 'Confused', 'Sad', 'Neutral', 'Inspired'].map(mood => t(`mood_${mood}`));

    switch (currentMode) {
      case 'create':
        return (
          <CreateEntryForm
            initialEntry={selectedEntry || undefined}
            onSave={addOrUpdateEntry}
            onCancel={() => {
              setCurrentMode('list');
              setSelectedEntry(null);
            }}
            onDelete={deleteEntry}
            t={t}
            moodOptions={translatedMoods}
          />
        );
      case 'detail':
        return selectedEntry ? (
          <EntryDetail
            entry={selectedEntry}
            onBack={() => {
              setCurrentMode('list');
              setSelectedEntry(null);
            }}
            onEdit={(entryToEdit) => {
              setSelectedEntry(entryToEdit);
              setCurrentMode('create');
            }}
            onTriggerAITool={triggerAITool}
            isOnline={isOnline}
            t={t}
          />
        ) : (
          <div className="text-center text-white text-xl mt-16">{t('entryNotFound')}</div>
        );
      case 'list':
      default:
        return (
          <>
            {currentPrompt && (
              <div className="bg-gradient-to-r from-indigo-800 to-purple-800 p-6 rounded-xl shadow-xl text-white text-center mb-8 mx-auto max-w-xl border border-purple-700">
                <h3 className="text-xl font-semibold mb-2">{t('promptForInspiration')}</h3>
                {currentPrompt.type === 'text' ? (
                  <p className="text-lg italic text-indigo-100 mb-4">{currentPrompt.text}</p>
                ) : (
                  <>
                    <p className="text-lg italic text-indigo-100 mb-4">{currentPrompt.text}</p>
                    <img src={`https://picsum.photos/400/200?random=${currentPrompt.id}`} alt={t('visualInspiration')} className="w-full h-auto rounded-lg mt-4 object-cover" />
                  </>
                )}

                <Button variant="outline" size="sm" onClick={generateRandomPrompt}>
                  {t('nextPrompt')}
                </Button>
              </div>
            )}

            {entries.length === 0 ? (
              <div className="text-center text-indigo-200 text-xl mt-16 p-6 bg-indigo-900 bg-opacity-30 rounded-xl max-w-md mx-auto">
                <p className="mb-4">{t('noDreamsYet')}</p>
                <p>{t('clickNewEntry')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-8 max-w-6xl mx-auto pb-32">
                {entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onClick={openEntryDetail} t={t} />
                ))}
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="relative min-h-screen font-sans text-white">
      <DreamscapeBackground />

      <div className="relative z-10 p-4 pb-20"> {/* pb-20 for fixed footer */}
        <header className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left mb-8 py-4 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-sm rounded-xl px-6 shadow-lg border border-indigo-700">
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4 sm:mb-0">
            {t('appName')}
          </h1>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => {
                setCurrentMode('create');
                setSelectedEntry(null);
              }}
              variant="primary"
            >
              {t('newEntry')}
            </Button>
            <Button onClick={generateRandomPrompt} variant="outline">
              {t('inspireMe')}
            </Button>
            <Button onClick={() => setIsInviteModalOpen(true)} variant="ghost" className="text-indigo-200 hover:text-white">
              {t('inviteFriend')}
            </Button>
            <Button onClick={() => setIsFindNearbyUsersModalOpen(true)} variant="ghost" className="text-indigo-200 hover:text-white">
              {t('findUsers')}
            </Button>
            <Button onClick={() => setIsMyConnectionsModalOpen(true)} variant="ghost" className="text-indigo-200 hover:text-white">
              {t('myConnections')}
            </Button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-180px)]"> {/* Adjust height for header/footer */}
          {renderContent()}
        </main>
      </div>

      {/* AI Result Modal */}
      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title={aiToolTitle}>
        {aiLoading && <LoadingSpinner />}
        {aiError && <p className="text-red-300 mb-4 text-center">{t(aiError)}</p>} {/* Translate aiError */}
        {apiKeyRequiredMessage && (
          <ApiKeyPrompt onSelectKey={handleApiKeyPromptSelect} message={apiKeyRequiredMessage} t={t} />
        )}
        {!aiLoading && !aiError && aiResult && !apiKeyRequiredMessage && (
          <>
            {aiImageResult ? (
              <div className="flex flex-col items-center">
                <img src={aiImageResult} alt={t('aiGeneratedVisual')} className="max-w-full h-auto rounded-lg shadow-lg mb-4" /> {/* Translate alt text */}
                <p className="text-indigo-100 text-lg text-center">{t('imageGeneratedSuccessfully')}</p> {/* Translate success message */}
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-indigo-100 text-lg">{aiResult}</p>
            )}
          </>
        )}
        {!aiLoading && !aiError && !aiResult && !apiKeyRequiredMessage && <p className="text-indigo-300 text-center">{t('noResultYet')}</p>}
      </Modal>

      {/* Language Selector Modal */}
      <LanguageSelectorModal isOpen={showLanguageSelector} onSelectLanguage={handleLanguageSelect} />

      {/* Invite Friend Modal */}
      <InviteFriendModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

      {/* Find Nearby Users Modal */}
      <FindNearbyUsersModal
        isOpen={isFindNearbyUsersModalOpen}
        onClose={() => setIsFindNearbyUsersModalOpen(false)}
        onViewProfile={handleViewSimulatedProfile}
        followedUserIds={followedUserIds}
        onToggleFollow={toggleFollow}
        currentUserKeywords={currentUserKeywords}
      />

      {/* Simulated User Profile Modal */}
      <SimulatedUserProfileModal
        isOpen={!!selectedSimulatedUser}
        onClose={handleCloseSimulatedProfile}
        user={selectedSimulatedUser}
        isFollowing={!!selectedSimulatedUser && followedUserIds.has(selectedSimulatedUser.id)}
        onToggleFollow={toggleFollow}
        currentUserKeywords={currentUserKeywords}
      />

      {/* My Connections Modal */}
      <MyConnectionsModal
        isOpen={isMyConnectionsModalOpen}
        onClose={() => setIsMyConnectionsModalOpen(false)}
        followedUserIds={followedUserIds}
        onViewProfile={handleViewSimulatedProfile}
        onToggleFollow={toggleFollow}
        currentUserKeywords={currentUserKeywords}
      />


      {/* Sticky Footer for Mobile-First Approach */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-r from-indigo-900 to-purple-900 p-4 shadow-top border-t border-indigo-700 flex justify-around items-center md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCurrentMode('list');
            setSelectedEntry(null);
          }}
          className="flex flex-col items-center text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          {t('footerList')}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setCurrentMode('create');
            setSelectedEntry(null);
          }}
          className="flex flex-col items-center text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('footerNew')}
        </Button>
        <Button variant="outline" size="sm" onClick={generateRandomPrompt} className="flex flex-col items-center text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {t('footerInspire')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsInviteModalOpen(true)}
          className="flex flex-col items-center text-sm text-indigo-200 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354l.001.001V21h-1V4.354a3 3 0 01-5.999 0H3v-1h3.001A3 3 0 0112 0v4.354zM21 4h-3a3 3 0 00-3-3H7a3 3 0 00-3 3v1h17v-1z" />
          </svg>
          {t('footerInvite')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFindNearbyUsersModalOpen(true)}
          className="flex flex-col items-center text-sm text-indigo-200 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {t('footerFindUsers')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMyConnectionsModalOpen(true)}
          className="flex flex-col items-center text-sm text-indigo-200 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('footerConnections')}
        </Button>
      </footer>
    </div>
  );
};

export default App;