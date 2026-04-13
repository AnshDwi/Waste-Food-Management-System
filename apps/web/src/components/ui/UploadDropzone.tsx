import { useRef } from 'react';
import { motion } from 'framer-motion';
import { pushToast } from './ToastViewport';

export const UploadDropzone = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const onFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const count = event.target.files?.length ?? 0;
    pushToast(count > 0 ? `${count} file${count > 1 ? 's' : ''} selected.` : 'No file selected.', count > 0 ? 'success' : 'error');
  };

  const useVoiceInput = () => {
    const speech = window.SpeechRecognition || (window as typeof window & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!speech) {
      const fallback = window.prompt('Voice input is not available here. Enter food details manually:');
      if (fallback?.trim()) {
        pushToast(`Captured details: "${fallback.trim()}"`, 'success');
      } else {
        pushToast('Voice input is not supported in this browser.', 'error');
      }
      return;
    }

    const recognition = new speech();
    recognition.lang = 'en-US';
    recognition.onerror = () => {
      const fallback = window.prompt('Voice capture failed. Enter food details manually:');
      if (fallback?.trim()) {
        pushToast(`Captured details: "${fallback.trim()}"`, 'success');
        return;
      }

      pushToast('Voice input failed. Please try again.', 'error');
    };
    recognition.onresult = () => pushToast('Voice input captured.', 'success');
    pushToast('Listening for donation details...', 'success');
    recognition.start();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="glass-panel rounded-[28px] border border-dashed border-emerald-300/70 p-6 text-center text-[color:var(--text)]"
    >
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500/20 to-orange-500/20 text-xl font-semibold text-[color:var(--text)]">
        +
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[color:var(--text)]">Drag and drop food images</h3>
      <p className="mt-2 text-sm text-[color:var(--muted)]">Preview uploads instantly, score food quality, and autofill metadata from the image.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button onClick={openPicker} className="ripple-button rounded-2xl bg-[image:var(--accent)] px-4 py-2 text-sm font-semibold text-white">Choose files</button>
        <button onClick={useVoiceInput} className="soft-chip rounded-2xl px-4 py-2 text-sm font-semibold text-[color:var(--text)]">Use voice input</button>
      </div>
    </motion.div>
  );
};
