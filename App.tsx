
import React, { useState, useEffect, useCallback } from 'react';
import { DreamEntry, AppMode, Prompt, ToolType, ApiResponse } from './types';
import { loadDreamEntries, saveDreamEntries } from './services/localStorageService';
import {
  PREDEFINED_PROMPTS, // Still needed for structure, but content from locales
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

const App: React.FC = () => {
  const { locale, setLocale, t } = useLocale(); // Use the locale hook
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [currentMode, setCurrentMode] = useState<AppMode>('list');
  const [selectedEntry, setSelectedEntry] = useState<DreamEntry | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');
  const [aiImageResult, setAiImageResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiToolTitle, setAiToolTitle] = useState<string>('');

  // API Key state for image generation (which explicitly requires user selection)
  const [apiKeyRequiredMessage, setApiKeyRequiredMessage] = useState<string | null>(null);

  // Initialize: Load entries, check language preference, set online status
  useEffect(() => {
    setEntries(loadDreamEntries());

    // Check if locale is already set, if not, show language selector
    if (!localStorage.getItem('dreamWeaverLocale')) {
      setShowLanguageSelector(true);
    } else {
      // If locale is set, ensure it's loaded by LocaleProvider and hide selector
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

  // Save entries whenever the 'entries' state changes
  useEffect(() => {
    saveDreamEntries(entries);
  }, [entries]);

  const handleLanguageSelect = useCallback((selectedLocale: string) => {
    setLocale(selectedLocale);
    localStorage.setItem('dreamWeaverLocale', selectedLocale); // Ensure it's explicitly saved
    setShowLanguageSelector(false);
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
    const translatedPrompts: Prompt[] = [
      { id: 'p1', text: t('prompt_hiddenGarden'), type: 'text' },
      { id: 'p2', text: t('prompt_dreamMap'), type: 'text' },
      { id: 'p3', text: t('prompt_speakingAnimal'), type: 'text' },
      { id: 'p4', text: t('prompt_emotionsAsColors'), type: 'text' },
      { id: 'p5', text: t('prompt_forgottenLullaby'), type: 'text' },
      { id: 'p6', text: t('prompt_stardustCreature'), type: 'image' },
      { id: 'p7', text: t('prompt_futuristicCity'), type: 'image' },
      { id: 'p8', text: t('prompt_readingNook'), type: 'image' },
    ];
    const randomIndex = Math.floor(Math.random() * translatedPrompts.length);
    setCurrentPrompt(translatedPrompts[randomIndex]);
  }, [t]); // Depend on 't' to re-generate if locale changes

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
          setAiResult(t('imageGeneratedSuccessfully'));
        }
      } else {
        result = { success: false, message: t('apiError_unknownTool') };
      }

      if (result.success) {
        setAiResult(result.data);
      } else {
        setAiError(result.message);
        if (result.message.includes("API key error")) { // Check for specific API key messages
          setApiKeyRequiredMessage(result.message);
        }
      }
    } catch (error: any) {
      console.error("Error during AI tool call:", error);
      setAiError(`${t('apiError_unexpected')} ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  }, [t]); // Depend on 't' so instructions update with locale

  const handleApiKeyPromptSelect = useCallback(async () => {
    setApiKeyRequiredMessage(null); // Clear previous message
    const result = await handleApiKeySelection();
    if (!result.success) {
      setAiError(result.message);
    } else {
      setAiError(null); // Clear generic error if selection initiated successfully
    }
  }, []);

  const renderContent = () => {
    // Mood options need to be translated for CreateEntryForm
    // Removed the problematic line that caused the error:
    // const translatedMoodOptions = PREDEFINED_PROMPTS.map(p => t(`mood_${p.id.split('_')[1]}`)).filter(m => m !== `mood_${p.id.split('_')[1]}`); // Filter out non-mood prompts
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
            t={t} // Pass translation function
            moodOptions={translatedMoods} // Pass translated mood options
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
            t={t} // Pass translation function
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
                    <img src={`https://picsum.photos/400/200?random=${currentPrompt.id}`} alt="Visual Prompt" className="w-full h-auto rounded-lg mt-4 object-cover" />
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
          </div>
        </header>

        <main className="min-h-[calc(100vh-180px)]"> {/* Adjust height for header/footer */}
          {renderContent()}
        </main>
      </div>

      {/* AI Result Modal */}
      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title={aiToolTitle}>
        {aiLoading && <LoadingSpinner />}
        {aiError && <p className="text-red-300 mb-4 text-center">{aiError}</p>}
        {apiKeyRequiredMessage && (
          <ApiKeyPrompt onSelectKey={handleApiKeyPromptSelect} message={apiKeyRequiredMessage} t={t} />
        )}
        {!aiLoading && !aiError && aiResult && !apiKeyRequiredMessage && (
          <>
            {aiImageResult ? (
              <div className="flex flex-col items-center">
                <img src={aiImageResult} alt="AI Generated Visual" className="max-w-full h-auto rounded-lg shadow-lg mb-4" />
                <p className="text-indigo-100 text-lg text-center">{aiResult}</p>
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
      </footer>
    </div>
  );
};

export default App;
