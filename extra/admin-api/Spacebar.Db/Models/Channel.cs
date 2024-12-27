using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("channels")]
public partial class Channel
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("name", TypeName = "character varying")]
    public string? Name { get; set; }

    [Column("icon")]
    public string? Icon { get; set; }

    [Column("type")]
    public int Type { get; set; }

    [Column("last_message_id", TypeName = "character varying")]
    public string? LastMessageId { get; set; }

    [Column("guild_id", TypeName = "character varying")]
    public string? GuildId { get; set; }

    [Column("parent_id", TypeName = "character varying")]
    public string? ParentId { get; set; }

    [Column("owner_id", TypeName = "character varying")]
    public string? OwnerId { get; set; }

    [Column("last_pin_timestamp")]
    public int? LastPinTimestamp { get; set; }

    [Column("default_auto_archive_duration")]
    public int? DefaultAutoArchiveDuration { get; set; }

    [Column("permission_overwrites")]
    public string? PermissionOverwrites { get; set; }

    [Column("video_quality_mode")]
    public int? VideoQualityMode { get; set; }

    [Column("bitrate")]
    public int? Bitrate { get; set; }

    [Column("user_limit")]
    public int? UserLimit { get; set; }

    [Column("nsfw")]
    public bool Nsfw { get; set; }

    [Column("rate_limit_per_user")]
    public int? RateLimitPerUser { get; set; }

    [Column("topic", TypeName = "character varying")]
    public string? Topic { get; set; }

    [Column("retention_policy_id", TypeName = "character varying")]
    public string? RetentionPolicyId { get; set; }

    [Column("flags")]
    public int Flags { get; set; }

    [Column("default_thread_rate_limit_per_user")]
    public int DefaultThreadRateLimitPerUser { get; set; }

    [ForeignKey("GuildId")]
    [InverseProperty("Channels")]
    public virtual Guild? Guild { get; set; }

    [InverseProperty("AfkChannel")]
    public virtual ICollection<Guild> GuildAfkChannels { get; set; } = new List<Guild>();

    [InverseProperty("PublicUpdatesChannel")]
    public virtual ICollection<Guild> GuildPublicUpdatesChannels { get; set; } = new List<Guild>();

    [InverseProperty("RulesChannel")]
    public virtual ICollection<Guild> GuildRulesChannels { get; set; } = new List<Guild>();

    [InverseProperty("SystemChannel")]
    public virtual ICollection<Guild> GuildSystemChannels { get; set; } = new List<Guild>();

    [InverseProperty("WidgetChannel")]
    public virtual ICollection<Guild> GuildWidgetChannels { get; set; } = new List<Guild>();

    [InverseProperty("Parent")]
    public virtual ICollection<Channel> InverseParent { get; set; } = new List<Channel>();

    [InverseProperty("Channel")]
    public virtual ICollection<Invite> Invites { get; set; } = new List<Invite>();

    [InverseProperty("Channel")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    [ForeignKey("OwnerId")]
    [InverseProperty("Channels")]
    public virtual User? Owner { get; set; }

    [ForeignKey("ParentId")]
    [InverseProperty("InverseParent")]
    public virtual Channel? Parent { get; set; }

    [InverseProperty("Channel")]
    public virtual ICollection<ReadState> ReadStates { get; set; } = new List<ReadState>();

    [InverseProperty("Channel")]
    public virtual ICollection<Recipient> Recipients { get; set; } = new List<Recipient>();

    [InverseProperty("Channel")]
    public virtual ICollection<VoiceState> VoiceStates { get; set; } = new List<VoiceState>();

    [InverseProperty("Channel")]
    public virtual ICollection<Webhook> WebhookChannels { get; set; } = new List<Webhook>();

    [InverseProperty("SourceChannel")]
    public virtual ICollection<Webhook> WebhookSourceChannels { get; set; } = new List<Webhook>();

    [ForeignKey("ChannelsId")]
    [InverseProperty("Channels")]
    public virtual ICollection<Message> MessagesNavigation { get; set; } = new List<Message>();
}
