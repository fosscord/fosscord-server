using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("applications")]
[Index("BotUserId", Name = "REL_2ce5a55796fe4c2f77ece57a64", IsUnique = true)]
public partial class Application
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("icon", TypeName = "character varying")]
    public string? Icon { get; set; }

    [Column("description", TypeName = "character varying")]
    public string? Description { get; set; }

    [Column("summary", TypeName = "character varying")]
    public string? Summary { get; set; }

    [Column("type")]
    public string? Type { get; set; }

    [Column("hook")]
    public bool Hook { get; set; }

    [Column("bot_public")]
    public bool BotPublic { get; set; }

    [Column("bot_require_code_grant")]
    public bool BotRequireCodeGrant { get; set; }

    [Column("verify_key", TypeName = "character varying")]
    public string VerifyKey { get; set; } = null!;

    [Column("flags")]
    public int Flags { get; set; }

    [Column("redirect_uris")]
    public string? RedirectUris { get; set; }

    [Column("rpc_application_state")]
    public int? RpcApplicationState { get; set; }

    [Column("store_application_state")]
    public int? StoreApplicationState { get; set; }

    [Column("verification_state")]
    public int? VerificationState { get; set; }

    [Column("interactions_endpoint_url", TypeName = "character varying")]
    public string? InteractionsEndpointUrl { get; set; }

    [Column("integration_public")]
    public bool? IntegrationPublic { get; set; }

    [Column("integration_require_code_grant")]
    public bool? IntegrationRequireCodeGrant { get; set; }

    [Column("discoverability_state")]
    public int? DiscoverabilityState { get; set; }

    [Column("discovery_eligibility_flags")]
    public int? DiscoveryEligibilityFlags { get; set; }

    [Column("tags")]
    public string? Tags { get; set; }

    [Column("cover_image", TypeName = "character varying")]
    public string? CoverImage { get; set; }

    [Column("install_params")]
    public string? InstallParams { get; set; }

    [Column("terms_of_service_url", TypeName = "character varying")]
    public string? TermsOfServiceUrl { get; set; }

    [Column("privacy_policy_url", TypeName = "character varying")]
    public string? PrivacyPolicyUrl { get; set; }

    [Column("guild_id", TypeName = "character varying")]
    public string? GuildId { get; set; }

    [Column("custom_install_url", TypeName = "character varying")]
    public string? CustomInstallUrl { get; set; }

    [Column("owner_id", TypeName = "character varying")]
    public string? OwnerId { get; set; }

    [Column("bot_user_id", TypeName = "character varying")]
    public string? BotUserId { get; set; }

    [Column("team_id", TypeName = "character varying")]
    public string? TeamId { get; set; }

    [ForeignKey("BotUserId")]
    [InverseProperty("ApplicationBotUser")]
    public virtual User? BotUser { get; set; }

    [ForeignKey("GuildId")]
    [InverseProperty("Applications")]
    public virtual Guild? Guild { get; set; }

    [InverseProperty("Application")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    [ForeignKey("OwnerId")]
    [InverseProperty("ApplicationOwners")]
    public virtual User? Owner { get; set; }

    [ForeignKey("TeamId")]
    [InverseProperty("Applications")]
    public virtual Team? Team { get; set; }

    [InverseProperty("Application")]
    public virtual ICollection<Webhook> Webhooks { get; set; } = new List<Webhook>();
}
