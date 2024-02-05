/**
 * Please note that the default values provided below are intended solely for testing purposes and should not be used in production or treated as real secrets.
 */

export const eddsaPrivateKey = process.env.EDDSA_PRIVATE_KEY || '30dfb303b364648f8671199c49a922636961033f45c8374d78083b9ca323a5b5';
export const lemonadeApiUrl = process.env.LEMONADE_API_URL;
export const providerName = process.env.PROVIDER_NAME || 'lemonade-zupass';
export const uuidNamespace = process.env.UUID_NAMESPACE || '5ea7f241-94a2-4099-b986-bab20fc8443d';
export const zupassPublicKey = JSON.parse(process.env.ZUPASS_PUBLIC_KEY || '["05e0c4e8517758da3a26c80310ff2fe65b9f85d89dfc9c80e6d0b6477f88173e", "29ae64b615383a0ebb1bc37b3a642d82d37545f0f5b1444330300e4c4eedba3f"]');
