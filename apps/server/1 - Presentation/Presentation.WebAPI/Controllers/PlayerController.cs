using Microsoft.AspNetCore.Mvc;

namespace Presentation.WebAPI.Controllers
{
    [ApiController]
    [Route("api/players")]
    public class PlayerController : ControllerBase
    {
        [HttpPost("connect")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult Connect([FromBody] ConnectRequest request)
        {
            // Simple response - no layers yet!
            return Ok(new
            {
                playerId = request.PlayerId,
                tenantId = request.TenantId,
                name = request.Name,
                state = "Online"
            });
        }

        public record ConnectRequest(
            string TenantId,
            string PlayerId,
            string Name
        );
    }
}
