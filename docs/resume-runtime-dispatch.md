# Resume runtime dispatch

The dispatch boundary accepts only an eligible preserved resume context. Waiting or missing contexts do not reach the runtime. The dispatch does not select a next Experience and does not restart the current Experience.

Check with: node scripts/test-adaptive-resume-runtime-dispatch.js
