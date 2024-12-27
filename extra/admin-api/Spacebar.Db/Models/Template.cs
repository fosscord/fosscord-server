using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("templates")]
[Index("Code", Name = "UQ_be38737bf339baf63b1daeffb55", IsUnique = true)]
public partial class Template
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("code", TypeName = "character varying")]
    public string Code { get; set; } = null!;

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("description", TypeName = "character varying")]
    public string? Description { get; set; }

    [Column("usage_count")]
    public int? UsageCount { get; set; }

    [Column("creator_id", TypeName = "character varying")]
    public string? CreatorId { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [Column("source_guild_id", TypeName = "character varying")]
    public string? SourceGuildId { get; set; }

    [Column("serialized_source_guild")]
    public string SerializedSourceGuild { get; set; } = null!;

    [ForeignKey("CreatorId")]
    [InverseProperty("Templates")]
    public virtual User? Creator { get; set; }

    [InverseProperty("Template")]
    public virtual ICollection<Guild> Guilds { get; set; } = new List<Guild>();

    [ForeignKey("SourceGuildId")]
    [InverseProperty("Templates")]
    public virtual Guild? SourceGuild { get; set; }
}
