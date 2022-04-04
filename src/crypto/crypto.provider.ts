import { Provider } from '@nestjs/common';
import * as crypto from 'crypto';

export const CryptoProviderName = 'lib:crypto';
export type CryptoProvider = typeof crypto;

export const CryptoProvider: Provider = {
    provide: CryptoProviderName,
    useValue: crypto,
};
