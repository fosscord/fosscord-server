using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("relationships")]
[Index("FromId", "ToId", Name = "IDX_a0b2ff0a598df0b0d055934a17", IsUnique = true)]
public partial class Relationship
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("from_id", TypeName = "character varying")]
    public string FromId { get; set; } = null!;

    [Column("to_id", TypeName = "character varying")]
    public string ToId { get; set; } = null!;

    [Column("nickname", TypeName = "character varying")]
    public string? Nickname { get; set; }

    [Column("type")]
    public int Type { get; set; }

    [ForeignKey("FromId")]
    [InverseProperty("RelationshipFroms")]
    public virtual User From { get; set; } = null!;

    [ForeignKey("ToId")]
    [InverseProperty("RelationshipTos")]
    public virtual User To { get; set; } = null!;
}
