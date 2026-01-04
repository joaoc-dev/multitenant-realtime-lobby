namespace Data.Redis
{
    public interface IRedisClient
    {
        Task<bool> SetAddAsync(string key, string value);
        Task<bool> SetRemoveAsync(string key, string value);
        Task<string[]> SetMembersAsync(string key);
        Task<bool> StringSetAsync(string key, string value);
        Task<string?> StringGetAsync(string key);
        Task<bool> KeyDeleteAsync(string key);
    }
}
