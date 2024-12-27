using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("badges")]
public partial class Badge
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("description", TypeName = "character varying")]
    public string Description { get; set; } = null!;

    [Column("icon", TypeName = "character varying")]
    public string Icon { get; set; } = null!;

    [Column("link", TypeName = "character varying")]
    public string? Link { get; set; }
}
