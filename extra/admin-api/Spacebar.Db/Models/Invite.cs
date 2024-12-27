using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("invites")]
public partial class Invite
{
    [Key]
    [Column("code", TypeName = "character varying")]
    public string Code { get; set; } = null!;

    [Column("temporary")]
    public bool Temporary { get; set; }

    [Column("uses")]
    public int Uses { get; set; }

    [Column("max_uses")]
    public int MaxUses { get; set; }

    [Column("max_age")]
    public int MaxAge { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("expires_at", TypeName = "timestamp without time zone")]
    public DateTime? ExpiresAt { get; set; }

    [Column("guild_id", TypeName = "character varying")]
    public string? GuildId { get; set; }

    [Column("channel_id", TypeName = "character varying")]
    public string? ChannelId { get; set; }

    [Column("inviter_id", TypeName = "character varying")]
    public string? InviterId { get; set; }

    [Column("target_user_id", TypeName = "character varying")]
    public string? TargetUserId { get; set; }

    [Column("target_user_type")]
    public int? TargetUserType { get; set; }

    [Column("vanity_url")]
    public bool? VanityUrl { get; set; }

    [Column("flags")]
    public int Flags { get; set; }

    [ForeignKey("ChannelId")]
    [InverseProperty("Invites")]
    public virtual Channel? Channel { get; set; }

    [ForeignKey("GuildId")]
    [InverseProperty("Invites")]
    public virtual Guild? Guild { get; set; }

    [ForeignKey("InviterId")]
    [InverseProperty("InviteInviters")]
    public virtual User? Inviter { get; set; }

    [ForeignKey("TargetUserId")]
    [InverseProperty("InviteTargetUsers")]
    public virtual User? TargetUser { get; set; }
}
