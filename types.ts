
export interface UserProfile {
  id: string;
  legalAccepted: boolean;
  onboardingDone: boolean;
  name?: string;
}

export enum RoutePath {
  Welcome = '/welcome',
  Legal = '/legal',
  Onboarding = '/onboarding',
  Home = '/app/home',
  Checkin = '/app/checkin',
  Reminders = '/app/reminders',
  VisitPrep = '/app/visit-prep',
  Settings = '/app/settings'
}
