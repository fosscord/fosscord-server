using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("audit_logs")]
public partial class AuditLog
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("user_id", TypeName = "character varying")]
    public string? UserId { get; set; }

    [Column("action_type")]
    public int ActionType { get; set; }

    [Column("options")]
    public string? Options { get; set; }

    [Column("changes")]
    public string Changes { get; set; } = null!;

    [Column("reason", TypeName = "character varying")]
    public string? Reason { get; set; }

    [Column("target_id", TypeName = "character varying")]
    public string? TargetId { get; set; }

    [ForeignKey("TargetId")]
    [InverseProperty("AuditLogTargets")]
    public virtual User? Target { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("AuditLogUsers")]
    public virtual User? User { get; set; }
}
