namespace Presentation.MatchmakingWorker.Configuration
{
    using Data.Redis.Configuration;
    using Application.Services.Configuration;

    public static class DependenciesConfiguration
    {
        public static IServiceCollection ConfigureDependencies(this IServiceCollection services)
        {
            services.ConfigureDataRedis();
            services.ConfigureApplicationServices();

            return services;
        }
    }
}
