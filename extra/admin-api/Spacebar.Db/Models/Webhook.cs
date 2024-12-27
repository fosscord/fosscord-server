using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("webhooks")]
public partial class Webhook
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("type")]
    public int Type { get; set; }

    [Column("name", TypeName = "character varying")]
    public string? Name { get; set; }

    [Column("avatar", TypeName = "character varying")]
    public string? Avatar { get; set; }

    [Column("token", TypeName = "character varying")]
    public string? Token { get; set; }

    [Column("guild_id", TypeName = "character varying")]
    public string? GuildId { get; set; }

    [Column("channel_id", TypeName = "character varying")]
    public string? ChannelId { get; set; }

    [Column("application_id", TypeName = "character varying")]
    public string? ApplicationId { get; set; }

    [Column("user_id", TypeName = "character varying")]
    public string? UserId { get; set; }

    [Column("source_guild_id", TypeName = "character varying")]
    public string? SourceGuildId { get; set; }

    [Column("source_channel_id", TypeName = "character varying")]
    public string? SourceChannelId { get; set; }

    [ForeignKey("ApplicationId")]
    [InverseProperty("Webhooks")]
    public virtual Application? Application { get; set; }

    [ForeignKey("ChannelId")]
    [InverseProperty("WebhookChannels")]
    public virtual Channel? Channel { get; set; }

    [ForeignKey("GuildId")]
    [InverseProperty("WebhookGuilds")]
    public virtual Guild? Guild { get; set; }

    [InverseProperty("Webhook")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    [ForeignKey("SourceChannelId")]
    [InverseProperty("WebhookSourceChannels")]
    public virtual Channel? SourceChannel { get; set; }

    [ForeignKey("SourceGuildId")]
    [InverseProperty("WebhookSourceGuilds")]
    public virtual Guild? SourceGuild { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Webhooks")]
    public virtual User? User { get; set; }
}
