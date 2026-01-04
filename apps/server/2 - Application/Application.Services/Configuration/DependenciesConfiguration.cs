namespace Application.Services.Configuration
{
    using Microsoft.Extensions.DependencyInjection;
    using Application.Services.Player;

    public static class DependenciesConfiguration
    {
        public static IServiceCollection ConfigureApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IPlayerService, PlayerService>();

            return services;
        }
    }
}
