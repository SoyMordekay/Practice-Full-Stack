import { useState, useEffect } from 'react';

type ScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

export const useScript = (src: string): ScriptStatus => {
  const [status, setStatus] = useState<ScriptStatus>(src ? 'loading' : 'idle');

  useEffect(() => {
    if (!src) {
      setStatus('idle');
      return;
    }

    let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.setAttribute('data-status', 'loading');
      document.body.appendChild(script);

      const setAttribute = (event: Event) => {
        script.setAttribute(
          'data-status',
          event.type === 'load' ? 'ready' : 'error',
        );
      };
      script.addEventListener('load', setAttribute);
      script.addEventListener('error', setAttribute);
    }
    
    const setStateFromEvent = (event: Event) => {
      setStatus(event.type === 'load' ? 'ready' : 'error');
    };
    
    script.addEventListener('load', setStateFromEvent);
    script.addEventListener('error', setStateFromEvent);
    
    return () => {
      if (script) {
        script.removeEventListener('load', setStateFromEvent);
        script.removeEventListener('error', setStateFromEvent);
      }
    };
  }, [src]); 

  return status;
};