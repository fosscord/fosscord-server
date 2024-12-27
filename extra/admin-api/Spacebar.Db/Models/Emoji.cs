using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("emojis")]
public partial class Emoji
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("animated")]
    public bool Animated { get; set; }

    [Column("available")]
    public bool Available { get; set; }

    [Column("guild_id", TypeName = "character varying")]
    public string GuildId { get; set; } = null!;

    [Column("user_id", TypeName = "character varying")]
    public string? UserId { get; set; }

    [Column("managed")]
    public bool Managed { get; set; }

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("require_colons")]
    public bool RequireColons { get; set; }

    [Column("roles")]
    public string Roles { get; set; } = null!;

    [Column("groups")]
    public string? Groups { get; set; }

    [ForeignKey("GuildId")]
    [InverseProperty("Emojis")]
    public virtual Guild Guild { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("Emojis")]
    public virtual User? User { get; set; }
}
