import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '@/mocks/server';

/** MSW XMLHttpRequest interceptor expects ProgressEvent in Node/jsdom. */
if (typeof globalThis.ProgressEvent === 'undefined') {
  globalThis.ProgressEvent = class extends Event {
    lengthComputable = false;
    loaded = 0;
    total = 0;
    constructor(type: string, init?: ProgressEventInit) {
      super(type, init);
      if (init) {
        this.lengthComputable = init.lengthComputable ?? false;
        this.loaded = init.loaded ?? 0;
        this.total = init.total ?? 0;
      }
    }
  } as typeof ProgressEvent;
}
beforeAll(()=>server.listen({onUnhandledRequest:'error'})); afterEach(()=>{cleanup(); server.resetHandlers();}); afterAll(()=>server.close());
