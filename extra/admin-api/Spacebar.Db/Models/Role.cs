using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("roles")]
public partial class Role
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("guild_id", TypeName = "character varying")]
    public string GuildId { get; set; } = null!;

    [Column("color")]
    public int Color { get; set; }

    [Column("hoist")]
    public bool Hoist { get; set; }

    [Column("managed")]
    public bool Managed { get; set; }

    [Column("mentionable")]
    public bool Mentionable { get; set; }

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("permissions", TypeName = "character varying")]
    public string Permissions { get; set; } = null!;

    [Column("position")]
    public int Position { get; set; }

    [Column("icon", TypeName = "character varying")]
    public string? Icon { get; set; }

    [Column("unicode_emoji", TypeName = "character varying")]
    public string? UnicodeEmoji { get; set; }

    [Column("tags")]
    public string? Tags { get; set; }

    [Column("flags")]
    public int Flags { get; set; }

    [ForeignKey("GuildId")]
    [InverseProperty("Roles")]
    public virtual Guild Guild { get; set; } = null!;

    [ForeignKey("RoleId")]
    [InverseProperty("Roles")]
    public virtual ICollection<Member> Indices { get; set; } = new List<Member>();

    [ForeignKey("RolesId")]
    [InverseProperty("Roles")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}
