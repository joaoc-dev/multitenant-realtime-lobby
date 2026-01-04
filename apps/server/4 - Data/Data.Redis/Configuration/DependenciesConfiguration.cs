namespace Data.Redis.Configuration
{
    using Microsoft.Extensions.DependencyInjection;
    using StackExchange.Redis;

    public static class DependenciesConfiguration
    {
        public static IServiceCollection ConfigureDataRedis(this IServiceCollection services)
        {
            services.AddSingleton<IConnectionMultiplexer>(sp =>
            {
                var configuration = ConfigurationOptions.Parse("localhost:6379");
                return ConnectionMultiplexer.Connect(configuration);
            });

            services.AddSingleton<IRedisClient, RedisClient>();

            return services;
        }
    }
}
