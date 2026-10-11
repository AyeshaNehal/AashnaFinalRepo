import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { MainLayout } from './components/Layout/MainLayout';
import { CameraView } from './components/Camera/CameraView';
import { OutputPanel } from './components/Output/OutputPanel';
import { ControlsBar } from './components/Controls/ControlsBar';
import { ModeSwitcher } from './components/Controls/ModeSwitcher';
import { TabBar, type TabMode } from './components/Navigation/TabBar';
import { FlashcardsView } from './components/Flashcards/FlashcardsView';
import { QuizView } from './components/Quiz/QuizView';
import { NumbersGameView } from './components/NumbersGame/NumbersGameView';
import { SpellingView } from './components/Spelling/SpellingView';
import { RoleplayView } from './components/Roleplay/RoleplayView';
import { ReplyPlaybackView } from './components/ReplyMode/ReplyPlaybackView';
import { TutorialsView } from './components/Tutorials/TutorialsView';
import { AuthView } from './components/Auth/AuthView';
import { LeaderboardView } from './components/Leaderboard/LeaderboardView';
import { AchievementsView } from './components/Achievements/AchievementsView';
import { OnboardingTour } from './components/Tour/OnboardingTour';
import { StartHereCard } from './components/Onboarding/StartHereCard';

// localStorage flag marking that the user has seen (or dismissed) the guided
// tour, so it only auto-starts on their very first visit.
const TOUR_SEEN_KEY = 'hasSeenAashnaTour';

// Separate flag for the lightweight "Start here" card. Stored independently so
// users who dismiss the card without taking the tour (or vice-versa) aren't
// affected. Safely falls back when localStorage is unavailable.
const START_CARD_KEY = 'hasSeenAashnaStartCard';

function safeLocalStorageGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeLocalStorageSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

function App() {
  // New users start on Flashcards; returning users retain their last tab by
  // defaulting to 'practice' (which is what the rest of the app expects for
  // the tour). The initial tab is overridden below once we know whether this
  // is a first visit.
  const isNewUser = safeLocalStorageGet(START_CARD_KEY) === null;
  const [activeTab, setActiveTab] = useState<TabMode>(isNewUser ? 'flashcards' : 'practice');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // True only when the user logged in via Firebase (email/password or Google).
  // False for guests and signed-out visitors — controls Logout visibility.
  const [isFirebaseAuth, setIsFirebaseAuth] = useState(false);
  const [tourRunning, setTourRunning] = useState(false);
  // Show the "Start here" card for genuinely new users; dismissed via the X button.
  const [showStartCard, setShowStartCard] = useState(false);

  /**
   * Called by AuthView for both real logins and guest sessions.
   * asGuest=false → Firebase-authenticated user; show Logout.
   * asGuest=true  → guest session; hide Logout.
   */
  const handleLogin = (asGuest: boolean) => {
    setIsAuthenticated(true);
    setIsFirebaseAuth(!asGuest);
  };

  // The tour highlights elements that only exist in the Practice tab, so
  // always return there before starting (covers replays from other tabs).
  const startTour = () => {
    setActiveTab('practice');
    setTourRunning(true);
  };

  // When the user authenticates for the first time in this session, decide
  // whether to show the "Start here" card and/or auto-start the tour.
  useEffect(() => {
    if (!isAuthenticated) return;

    const cardSeen   = safeLocalStorageGet(START_CARD_KEY) !== null;
    const tourSeen   = safeLocalStorageGet(TOUR_SEEN_KEY)  !== null;

    // Show the start card for genuinely new users (card key absent).
    if (!cardSeen) {
      setShowStartCard(true);
      // Flashcard tab is already the initial state for new users — no need to
      // override activeTab here.
    }

    // Auto-launch the tour only on the very first visit ever.
    if (!tourSeen) {
      safeLocalStorageSet(TOUR_SEEN_KEY, 'true');
      setActiveTab('practice');
      setTourRunning(true);
    }
  }, [isAuthenticated]);

  const handleDismissStartCard = () => {
    setShowStartCard(false);
    safeLocalStorageSet(START_CARD_KEY, 'true');
  };

  return (
    <Provider store={store}>
      <MainLayout onHelpClick={isAuthenticated ? startTour : undefined} isFirebaseAuth={isFirebaseAuth}>
        {!isAuthenticated ? (
          <AuthView onLogin={handleLogin} />
        ) : (
          <div className="w-full flex flex-col">
            {/* "Start here" card — shown once for new users, above the tab bar */}
            {showStartCard && (
              <StartHereCard
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  handleDismissStartCard();
                }}
                onDismiss={handleDismissStartCard}
              />
            )}

            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

            
            {activeTab === 'practice' ? (
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 w-full">
                <div className="w-full lg:w-[65%]">
                  <CameraView />
                </div>
                <div className="w-full lg:w-[35%] flex flex-col gap-3 sm:gap-5">
                  <ModeSwitcher />
                  <OutputPanel />
                  <ControlsBar />
                </div>
              </div>
            ) : activeTab === 'flashcards' ? (
              <div className="w-full">
                <FlashcardsView />
              </div>
            ) : activeTab === 'numbers_game' ? (
              <div className="w-full">
                <NumbersGameView />
              </div>
            ) : activeTab === 'quiz' ? (
              <div className="w-full">
                <QuizView />
              </div>
            ) : activeTab === 'spelling' ? (
              <div className="w-full">
                <SpellingView />
              </div>
            ) : activeTab === 'roleplay' ? (
              <div className="w-full">
                <RoleplayView />
              </div>
            ) : activeTab === 'reply_mode' ? (
              <div className="w-full">
                <ReplyPlaybackView />
              </div>
            ) : activeTab === 'tutorials' ? (
              <div className="w-full">
                <TutorialsView />
              </div>
            ) : activeTab === 'leaderboard' ? (
              <div className="w-full">
                <LeaderboardView />
              </div>
            ) : (
              <div className="w-full">
                <AchievementsView />
              </div>
            )}

            <OnboardingTour run={tourRunning} onFinish={() => setTourRunning(false)} />
          </div>
        )}
      </MainLayout>
    </Provider>
  );
}

export default App;
