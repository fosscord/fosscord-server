using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("embed_cache")]
public partial class EmbedCache
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("url", TypeName = "character varying")]
    public string Url { get; set; } = null!;

    [Column("embed")]
    public string Embed { get; set; } = null!;
}
