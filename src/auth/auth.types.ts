export enum AppRole {
  User = 'user',
  Admin = 'admin',
}

export type SessionUser = {
  id: number;
  supertokensId: string;
  displayName: string;
  email: string;
  role: AppRole;
  isAdmin: boolean;
};
