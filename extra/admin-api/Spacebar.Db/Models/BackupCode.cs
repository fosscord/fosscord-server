using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("backup_codes")]
public partial class BackupCode
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("code", TypeName = "character varying")]
    public string Code { get; set; } = null!;

    [Column("consumed")]
    public bool Consumed { get; set; }

    [Column("expired")]
    public bool Expired { get; set; }

    [Column("user_id", TypeName = "character varying")]
    public string? UserId { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("BackupCodes")]
    public virtual User? User { get; set; }
}
