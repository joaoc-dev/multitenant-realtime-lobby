using Application.Services.Player;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Presentation.WebAPI.Hubs;

namespace Presentation.WebAPI.Controllers
{
    [ApiController]
    [Route("api/players")]
    public class PlayerController : ControllerBase
    {
        private readonly IHubContext<LobbyHub> _hubContext;
        private readonly IPlayerService _playerService;

        public PlayerController(IPlayerService playerService, IHubContext<LobbyHub> hubContext)
        {
            _playerService = playerService;
            _hubContext = hubContext;
        }

        [HttpPost("connect")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Connect([FromBody] ConnectRequest request)
        {
            var result = await _playerService.ConnectAsync(
                new PlayerConnectionRequest
                {
                    PlayerId = request.PlayerId,
                    TenantId = request.TenantId
                }
            );

            return Ok(result);
        }

        [HttpPost("disconnect")]
        public async Task<IActionResult> Disconnect([FromBody] DisconnectRequest request)
        {
            var result = await _playerService.DisconnectAsync(
                new PlayerDisconnectionRequest
                {
                    PlayerId = request.PlayerId,
                    TenantId = request.TenantId
                }
            );

            return Ok(result);
        }

        public record DisconnectRequest(string TenantId, string PlayerId);

        [HttpGet("{tenantId}/online")]
        public async Task<IActionResult> GetOnlinePlayers(string tenantId)
        {
            var onlinePlayers = await _playerService.GetOnlinePlayersAsync(tenantId);

            return Ok(new
            {
                tenantId,
                onlinePlayers = onlinePlayers.Select(id => id.ToString()).ToArray(),
                count = onlinePlayers.Count()
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
