using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("members")]
[Index("Id", "GuildId", Name = "IDX_bb2bf9386ac443afbbbf9f12d3", IsUnique = true)]
public partial class Member
{
    [Key]
    [Column("index")]
    public int Index { get; set; }

    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("guild_id", TypeName = "character varying")]
    public string GuildId { get; set; } = null!;

    [Column("nick", TypeName = "character varying")]
    public string? Nick { get; set; }

    [Column("joined_at", TypeName = "timestamp without time zone")]
    public DateTime JoinedAt { get; set; }

    [Column("premium_since")]
    public long? PremiumSince { get; set; }

    [Column("deaf")]
    public bool Deaf { get; set; }

    [Column("mute")]
    public bool Mute { get; set; }

    [Column("pending")]
    public bool Pending { get; set; }

    [Column("settings")]
    public string Settings { get; set; } = null!;

    [Column("last_message_id", TypeName = "character varying")]
    public string? LastMessageId { get; set; }

    [Column("joined_by", TypeName = "character varying")]
    public string? JoinedBy { get; set; }

    [Column("avatar", TypeName = "character varying")]
    public string? Avatar { get; set; }

    [Column("banner", TypeName = "character varying")]
    public string? Banner { get; set; }

    [Column("bio", TypeName = "character varying")]
    public string Bio { get; set; } = null!;

    [Column("theme_colors")]
    public string? ThemeColors { get; set; }

    [Column("pronouns", TypeName = "character varying")]
    public string? Pronouns { get; set; }

    [Column("communication_disabled_until", TypeName = "timestamp without time zone")]
    public DateTime? CommunicationDisabledUntil { get; set; }

    [ForeignKey("GuildId")]
    [InverseProperty("Members")]
    public virtual Guild Guild { get; set; } = null!;

    [ForeignKey("Id")]
    [InverseProperty("Members")]
    public virtual User IdNavigation { get; set; } = null!;

    [ForeignKey("Index")]
    [InverseProperty("Indices")]
    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
