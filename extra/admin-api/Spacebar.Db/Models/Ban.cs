using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("bans")]
public partial class Ban
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("user_id", TypeName = "character varying")]
    public string? UserId { get; set; }

    [Column("guild_id", TypeName = "character varying")]
    public string? GuildId { get; set; }

    [Column("executor_id", TypeName = "character varying")]
    public string? ExecutorId { get; set; }

    [Column("ip", TypeName = "character varying")]
    public string Ip { get; set; } = null!;

    [Column("reason", TypeName = "character varying")]
    public string? Reason { get; set; }

    [ForeignKey("ExecutorId")]
    [InverseProperty("BanExecutors")]
    public virtual User? Executor { get; set; }

    [ForeignKey("GuildId")]
    [InverseProperty("Bans")]
    public virtual Guild? Guild { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("BanUsers")]
    public virtual User? User { get; set; }
}
