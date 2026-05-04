import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
export default tseslint.config({ ignores:['dist','coverage','node_modules','*.config.cjs','postcss.config.cjs'] }, js.configs.recommended, ...tseslint.configs.recommended, { files:['**/*.{ts,tsx}'], plugins:{'react-hooks':reactHooks,'react-refresh':reactRefresh}, rules:{...reactHooks.configs.recommended.rules,'react-refresh/only-export-components':'off','no-console':['error',{allow:['warn','error']}], 'react-hooks/set-state-in-effect':'off', 'react-hooks/exhaustive-deps':'off'} }, prettier);
