using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Presentation.WebAPI.Hubs;
using StackExchange.Redis;

namespace Presentation.WebAPI.Controllers
{
    [ApiController]
    [Route("api/players")]
    public class PlayerController : ControllerBase
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly IHubContext<LobbyHub> _hubContext;

        public PlayerController(IConnectionMultiplexer redis, IHubContext<LobbyHub> hubContext)
        {
            _redis = redis;
            _hubContext = hubContext;
        }

        [HttpPost("connect")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Connect([FromBody] ConnectRequest request)
        {
            var db = _redis.GetDatabase();

            // Real-world: Add player to the "online players" list for this tenant
            // Key: "tenant:epic-games-123:players:online"
            // Value: Set containing ["alice-123", "bob-456", ...]
            await db.SetAddAsync($"tenant:{request.TenantId}:players:online", request.PlayerId);

            // Real-world: Store their current state
            // Key: "tenant:epic-games-123:player:alice-123:state"
            // Value: "Online"
            await db.StringSetAsync(
                $"tenant:{request.TenantId}:player:{request.PlayerId}:state",
                "Online"
            );

            return Ok(new
            {
                playerId = request.PlayerId,
                tenantId = request.TenantId,
                name = request.Name,
                state = "Online"
            });
        }

        [HttpPost("disconnect")]
        public async Task<IActionResult> Disconnect([FromBody] DisconnectRequest request)
        {
            var db = _redis.GetDatabase();

            // Remove from "online players" set
            await db.SetRemoveAsync($"tenant:{request.TenantId}:players:online", request.PlayerId);

            // Delete their state (or set to "Offline")
            await db.KeyDeleteAsync($"tenant:{request.TenantId}:player:{request.PlayerId}:state");

            return Ok(new { playerId = request.PlayerId, message = "Disconnected" });
        }

        public record DisconnectRequest(string TenantId, string PlayerId);

        [HttpGet("{tenantId}/online")]
        public async Task<IActionResult> GetOnlinePlayers(string tenantId)
        {
            var db = _redis.GetDatabase();
            var onlinePlayerIds = await db.SetMembersAsync($"tenant:{tenantId}:players:online");

            return Ok(new
            {
                tenantId,
                onlinePlayers = onlinePlayerIds.Select(id => id.ToString()).ToArray(),
                count = onlinePlayerIds.Length
            });
        }

        [HttpPost("test-push")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> TestPush([FromBody] TestPushRequest request)
        {
            // Example: Push message via HubContext (Controller approach)
            await _hubContext.Clients.All.SendAsync("TestMessage", request.Message);
            
            return Ok(new { message = "Message sent via API endpoint", sentMessage = request.Message });
        }

        public record ConnectRequest(
            string TenantId,
            string PlayerId,
            string Name
        );

        public record TestPushRequest(string Message);
    }
}
