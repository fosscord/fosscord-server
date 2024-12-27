using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("notes")]
[Index("OwnerId", "TargetId", Name = "UQ_74e6689b9568cc965b8bfc9150b", IsUnique = true)]
public partial class Note
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("content", TypeName = "character varying")]
    public string Content { get; set; } = null!;

    [Column("owner_id", TypeName = "character varying")]
    public string? OwnerId { get; set; }

    [Column("target_id", TypeName = "character varying")]
    public string? TargetId { get; set; }

    [ForeignKey("OwnerId")]
    [InverseProperty("NoteOwners")]
    public virtual User? Owner { get; set; }

    [ForeignKey("TargetId")]
    [InverseProperty("NoteTargets")]
    public virtual User? Target { get; set; }
}
