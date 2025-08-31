export interface OAuthConnector {
  name: string;
  getAuthUrl(): string;
  handleCallback(code: string): Promise<void>;
  isHealthy(): Promise<boolean>;
}
