/**
 * Please note that the default values provided below are intended solely for testing purposes and should not be used in production or treated as real secrets.
 */

export const eddsaPrivateKey = process.env.EDDSA_PRIVATE_KEY || '30dfb303b364648f8671199c49a922636961033f45c8374d78083b9ca323a5b5';
export const providerName = process.env.PROVIDER_NAME || 'lemonade-zupass';
export const rpcUrls = process.env.RPC_URLS || 'https://ethereum.publicnode.com';
export const rsaPrivateKey = process.env.RSA_PRIVATE_KEY || '-----BEGIN RSA PRIVATE KEY-----MIIBOQIBAAJAVY6quuzCwyOWzymJ7C4zXjeV/232wt2ZgJZ1kHzjI73wnhQ3WQcLDFCSoi2lPUW8/zspk0qWvPdtp6Jg5Lu7hwIDAQABAkBEws9mQahZ6r1mq2zEm3D/VM9BpV//xtd6p/G+eRCYBT2qshGx42ucdgZCYJptFoW+HEx/jtzWe74yK6jGIkWJAiEAoNAMsPqwWwTyjDZCo9iKvfIQvd3MWnmtFmjiHoPtjx0CIQCIMypAEEkZuQUipMoreJrOlLJWdc0bfhzNAJjxsTv/8wIgQG0ZqI3GubBxu9rBOAM5EoA4VNjXVigJQEEk1jTkp8ECIQCHhsoq90mWM/p9L5cQzLDWkTYoPI49Ji+Iemi2T5MRqwIgQl07Es+KCn25OKXR/FJ5fu6A6A+MptABL3r8SEjlpLc=-----END RSA PRIVATE KEY-----';
export const simplehashApiKey = process.env.SIMPLEHASH_API_KEY;
export const uuidNamespace = process.env.UUID_NAMESPACE || '5ea7f241-94a2-4099-b986-bab20fc8443d';
export const zupassPublicKey = JSON.parse(process.env.ZUPASS_PUBLIC_KEY || '["05e0c4e8517758da3a26c80310ff2fe65b9f85d89dfc9c80e6d0b6477f88173e", "29ae64b615383a0ebb1bc37b3a642d82d37545f0f5b1444330300e4c4eedba3f"]');
