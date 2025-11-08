/**
 * Quick verification that the component can be imported and used
 */
import { FluencyLevelBadge } from '../FluencyLevelBadge';

// This file just verifies TypeScript compilation works
export function VerifyComponent() {
  return (
    <div>
      <FluencyLevelBadge level="A1" />
      <FluencyLevelBadge level="A2" size="small" />
      <FluencyLevelBadge level="B1" size="medium" showLabel={true} />
      <FluencyLevelBadge level="B2" size="large" showLabel={false} />
      <FluencyLevelBadge level="C1" showLabel />
    </div>
  );
}
