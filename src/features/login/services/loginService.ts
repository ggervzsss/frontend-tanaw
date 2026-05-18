import type { AuthUser } from "../../../shared/types/role.types";

export type LoginCredentials = {
  clientId: string;
  encryptionKey: string;
};

export type LoginServiceResponse = {
  user: AuthUser;
  token: string;
};

export async function loginService(_credentials: LoginCredentials): Promise<LoginServiceResponse> {
  void _credentials;
  throw new Error("loginService - real backend not yet integrated.");
}

export async function logoutService(): Promise<void> {
  throw new Error("logoutService - real backend not yet integrated.");
}
