namespace Data.Redis
{
    using StackExchange.Redis;

    internal class RedisClient : IRedisClient
    {
        private readonly IConnectionMultiplexer _multiplexer;

        public RedisClient(IConnectionMultiplexer multiplexer)
        {
            _multiplexer = multiplexer;
        }

        private IDatabase GetDatabase() => _multiplexer.GetDatabase();

        public async Task<bool> SetAddAsync(string key, string value)
        {
            return await GetDatabase().SetAddAsync(key, value);
        }

        public async Task<bool> SetRemoveAsync(string key, string value)
        {
            return await GetDatabase().SetRemoveAsync(key, value);
        }

        public async Task<string[]> SetMembersAsync(string key)
        {
            var members = await GetDatabase().SetMembersAsync(key);
            return members.Select(m => m.ToString()).ToArray();
        }

        public async Task<bool> StringSetAsync(string key, string value)
        {
            return await GetDatabase().StringSetAsync(key, value);
        }

        public async Task<string?> StringGetAsync(string key)
        {
            return await GetDatabase().StringGetAsync(key);
        }

        public async Task<bool> KeyDeleteAsync(string key)
        {
            return await GetDatabase().KeyDeleteAsync(key);
        }
    }
}
