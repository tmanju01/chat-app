import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectConversationSearchQuery } from '../conversationSelectors';
import { setSearchQuery } from '../conversationSlice';

export function ConversationSearch() {
  const dispatch = useAppDispatch();
  const storeQuery = useAppSelector(selectConversationSearchQuery);
  const [inputValue, setInputValue] = useState(storeQuery);
  const [prevStoreQuery, setPrevStoreQuery] = useState(storeQuery);
  const timerRef = useRef<number | null>(null);

  if (storeQuery !== prevStoreQuery) {
    setPrevStoreQuery(storeQuery);
    setInputValue(storeQuery);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleChange = (value: string) => {
    setInputValue(value);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      dispatch(setSearchQuery(value));
    }, 200);
  };

  const handleClear = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setInputValue('');
    dispatch(setSearchQuery(''));
  };

  return (
    <div className="px-3 pt-3 pb-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search inbox..."
          aria-label="Search conversations"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-8 pl-9 text-xs text-slate-900 placeholder-slate-400 transition-colors focus:border-violet-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-[#0B0D14]"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear conversation search"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

