using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("guilds")]
public partial class Guild
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("afk_channel_id", TypeName = "character varying")]
    public string? AfkChannelId { get; set; }

    [Column("afk_timeout")]
    public int? AfkTimeout { get; set; }

    [Column("banner", TypeName = "character varying")]
    public string? Banner { get; set; }

    [Column("default_message_notifications")]
    public int? DefaultMessageNotifications { get; set; }

    [Column("description", TypeName = "character varying")]
    public string? Description { get; set; }

    [Column("discovery_splash", TypeName = "character varying")]
    public string? DiscoverySplash { get; set; }

    [Column("explicit_content_filter")]
    public int? ExplicitContentFilter { get; set; }

    [Column("features")]
    public string Features { get; set; } = null!;

    [Column("primary_category_id", TypeName = "character varying")]
    public string? PrimaryCategoryId { get; set; }

    [Column("icon", TypeName = "character varying")]
    public string? Icon { get; set; }

    [Column("large")]
    public bool Large { get; set; }

    [Column("max_members")]
    public int? MaxMembers { get; set; }

    [Column("max_presences")]
    public int? MaxPresences { get; set; }

    [Column("max_video_channel_users")]
    public int? MaxVideoChannelUsers { get; set; }

    [Column("member_count")]
    public int? MemberCount { get; set; }

    [Column("presence_count")]
    public int? PresenceCount { get; set; }

    [Column("template_id", TypeName = "character varying")]
    public string? TemplateId { get; set; }

    [Column("mfa_level")]
    public int? MfaLevel { get; set; }

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("owner_id", TypeName = "character varying")]
    public string? OwnerId { get; set; }

    [Column("preferred_locale", TypeName = "character varying")]
    public string? PreferredLocale { get; set; }

    [Column("premium_subscription_count")]
    public int? PremiumSubscriptionCount { get; set; }

    [Column("premium_tier")]
    public int PremiumTier { get; set; }

    [Column("public_updates_channel_id", TypeName = "character varying")]
    public string? PublicUpdatesChannelId { get; set; }

    [Column("rules_channel_id", TypeName = "character varying")]
    public string? RulesChannelId { get; set; }

    [Column("region", TypeName = "character varying")]
    public string? Region { get; set; }

    [Column("splash", TypeName = "character varying")]
    public string? Splash { get; set; }

    [Column("system_channel_id", TypeName = "character varying")]
    public string? SystemChannelId { get; set; }

    [Column("system_channel_flags")]
    public int? SystemChannelFlags { get; set; }

    [Column("unavailable")]
    public bool Unavailable { get; set; }

    [Column("verification_level")]
    public int? VerificationLevel { get; set; }

    [Column("welcome_screen")]
    public string WelcomeScreen { get; set; } = null!;

    [Column("widget_channel_id", TypeName = "character varying")]
    public string? WidgetChannelId { get; set; }

    [Column("widget_enabled")]
    public bool WidgetEnabled { get; set; }

    [Column("nsfw_level")]
    public int? NsfwLevel { get; set; }

    [Column("nsfw")]
    public bool Nsfw { get; set; }

    [Column("parent", TypeName = "character varying")]
    public string? Parent { get; set; }

    [Column("premium_progress_bar_enabled")]
    public bool? PremiumProgressBarEnabled { get; set; }

    [Column("channel_ordering")]
    public string ChannelOrdering { get; set; } = null!;

    [ForeignKey("AfkChannelId")]
    [InverseProperty("GuildAfkChannels")]
    public virtual Channel? AfkChannel { get; set; }

    [InverseProperty("Guild")]
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    [InverseProperty("Guild")]
    public virtual ICollection<Ban> Bans { get; set; } = new List<Ban>();

    [InverseProperty("Guild")]
    public virtual ICollection<Channel> Channels { get; set; } = new List<Channel>();

    [InverseProperty("Guild")]
    public virtual ICollection<Emoji> Emojis { get; set; } = new List<Emoji>();

    [InverseProperty("Guild")]
    public virtual ICollection<Invite> Invites { get; set; } = new List<Invite>();

    [InverseProperty("Guild")]
    public virtual ICollection<Member> Members { get; set; } = new List<Member>();

    [InverseProperty("Guild")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    [ForeignKey("OwnerId")]
    [InverseProperty("Guilds")]
    public virtual User? Owner { get; set; }

    [ForeignKey("PublicUpdatesChannelId")]
    [InverseProperty("GuildPublicUpdatesChannels")]
    public virtual Channel? PublicUpdatesChannel { get; set; }

    [InverseProperty("Guild")]
    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();

    [ForeignKey("RulesChannelId")]
    [InverseProperty("GuildRulesChannels")]
    public virtual Channel? RulesChannel { get; set; }

    [InverseProperty("Guild")]
    public virtual ICollection<Sticker> Stickers { get; set; } = new List<Sticker>();

    [ForeignKey("SystemChannelId")]
    [InverseProperty("GuildSystemChannels")]
    public virtual Channel? SystemChannel { get; set; }

    [ForeignKey("TemplateId")]
    [InverseProperty("Guilds")]
    public virtual Template? Template { get; set; }

    [InverseProperty("SourceGuild")]
    public virtual ICollection<Template> Templates { get; set; } = new List<Template>();

    [InverseProperty("Guild")]
    public virtual ICollection<VoiceState> VoiceStates { get; set; } = new List<VoiceState>();

    [InverseProperty("Guild")]
    public virtual ICollection<Webhook> WebhookGuilds { get; set; } = new List<Webhook>();

    [InverseProperty("SourceGuild")]
    public virtual ICollection<Webhook> WebhookSourceGuilds { get; set; } = new List<Webhook>();

    [ForeignKey("WidgetChannelId")]
    [InverseProperty("GuildWidgetChannels")]
    public virtual Channel? WidgetChannel { get; set; }
}
