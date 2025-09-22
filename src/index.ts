export { UniversalLoginContextPanel } from './components/UniversalLoginContextPanel';
export type { UniversalLoginContextPanelProps } from './components/UniversalLoginContextPanel';
// Ensure styles are included as a side effect of importing the package
import './style';
// Public hook: subscribe to external changes
export { useUniversalLoginContextSubscription } from './hooks/useUniversalLoginContextSubscription';