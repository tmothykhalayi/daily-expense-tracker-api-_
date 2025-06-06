export class CreateCachingDto {
    key: string;
    value: string;
    ttl?: number; // Time to live in seconds (optional)
}