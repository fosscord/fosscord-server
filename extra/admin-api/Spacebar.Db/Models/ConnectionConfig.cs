using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("connection_config")]
public partial class ConnectionConfig
{
    [Key]
    [Column("key", TypeName = "character varying")]
    public string Key { get; set; } = null!;

    [Column("value")]
    public string? Value { get; set; }
}
