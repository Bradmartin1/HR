"use client";

import { HeadcountWidget } from "./widgets/HeadcountWidget";
import { PtoRequestsWidget } from "./widgets/PtoRequestsWidget";
import { OpenReviewsWidget } from "./widgets/OpenReviewsWidget";
import { RecentStrikesWidget } from "./widgets/RecentStrikesWidget";
import { OnboardingProgressWidget } from "./widgets/OnboardingProgressWidget";
import { RecognitionFeedWidget } from "./widgets/RecognitionFeedWidget";

export function HRDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <HeadcountWidget />
      <PtoRequestsWidget />
      <OpenReviewsWidget />
      <RecentStrikesWidget />
      <OnboardingProgressWidget />
      <RecognitionFeedWidget />
    </div>
  );
}
