using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("categories")]
public partial class Category
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name", TypeName = "character varying")]
    public string? Name { get; set; }

    [Column("localizations")]
    public string Localizations { get; set; } = null!;

    [Column("is_primary")]
    public bool? IsPrimary { get; set; }

    [Column("icon", TypeName = "character varying")]
    public string? Icon { get; set; }
}
