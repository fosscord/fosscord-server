using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("rate_limits")]
public partial class RateLimit
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("executor_id", TypeName = "character varying")]
    public string ExecutorId { get; set; } = null!;

    [Column("hits")]
    public int Hits { get; set; }

    [Column("blocked")]
    public bool Blocked { get; set; }

    [Column("expires_at", TypeName = "timestamp without time zone")]
    public DateTime ExpiresAt { get; set; }
}
