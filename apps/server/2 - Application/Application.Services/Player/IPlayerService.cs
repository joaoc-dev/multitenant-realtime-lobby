namespace Application.Services.Player
{
    public interface IPlayerService
    {
        Task<PlayerConnectionResult> ConnectAsync(PlayerConnectionRequest playerConnectionRequest);
        Task<PlayerDisconnectionResult> DisconnectAsync(PlayerDisconnectionRequest playerDisconnectionRequest);
        Task<IEnumerable<string>> GetOnlinePlayersAsync(string tenantId);
    }
}
