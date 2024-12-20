import { useCallback, useEffect, useState } from "react"
import { useEvent } from "react-use"
import { ExtensionMessage } from "../../src/shared/interfaces"
import ChatView from "./components/chat/ChatView"
import HistoryView from "./components/history/HistoryView"
import SettingsView from "./components/settings/SettingsView"
import WelcomeView from "./components/welcome/WelcomeView"
import { useExtensionState } from "./context/ExtensionStateContext"
import { vscode } from "./utils/vscode"

export function AppContent() {
  const { didHydrateState, showWelcome, shouldShowAnnouncement } = useExtensionState()
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(false)

  const handleMessage = useCallback((e: MessageEvent) => {
    const message: ExtensionMessage = e.data
    switch (message.type) {
      case "action":
        switch (message.action!) {
          case "settingsButtonClicked":
            setShowSettings(true)
            setShowHistory(false)
            break
          case "historyButtonClicked":
            setShowSettings(false)
            setShowHistory(true)
            break
          case "chatButtonClicked":
            setShowSettings(false)
            setShowHistory(false)
            break
        }
        break
    }
  }, [])

  useEvent("message", handleMessage)

  useEffect(() => {
    if (shouldShowAnnouncement) {
      setShowAnnouncement(true)
      vscode.postMessage({ type: "didShowAnnouncement" })
    }
  }, [shouldShowAnnouncement])

  if (!didHydrateState) {
    return null
  }

  if (showWelcome) {
    return <WelcomeView />
  }

  return (
    <>
      {showSettings && <SettingsView onDone={() => setShowSettings(false)} />}
      {showHistory && <HistoryView onDone={() => setShowHistory(false)} />}
      {/* Do not conditionally load ChatView, it's expensive and there's state we don't want to lose (user input, disableInput, askResponse promise, etc.) */}
      <ChatView
        showHistoryView={() => {
          setShowSettings(false)
          setShowHistory(true)
        }}
        isHidden={showSettings || showHistory}
        showAnnouncement={showAnnouncement}
        hideAnnouncement={() => {
          setShowAnnouncement(false)
        }}
      />
    </>
  )
}
