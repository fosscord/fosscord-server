using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("client_release")]
public partial class ClientRelease
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("pub_date", TypeName = "timestamp without time zone")]
    public DateTime PubDate { get; set; }

    [Column("url", TypeName = "character varying")]
    public string Url { get; set; } = null!;

    [Column("platform", TypeName = "character varying")]
    public string Platform { get; set; } = null!;

    [Column("enabled")]
    public bool Enabled { get; set; }

    [Column("notes", TypeName = "character varying")]
    public string? Notes { get; set; }
}
