using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;

namespace Presentation.WebAPI.Controllers
{
    [ApiController]
    [Route("api/players")]
    public class PlayerController : ControllerBase
    {
        private readonly IConnectionMultiplexer _redis;

        public PlayerController(IConnectionMultiplexer redis)
        {
            _redis = redis;
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

        public record ConnectRequest(
            string TenantId,
            string PlayerId,
            string Name
        );
    }
}
