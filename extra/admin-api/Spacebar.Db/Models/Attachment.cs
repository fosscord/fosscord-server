using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("attachments")]
public partial class Attachment
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("filename", TypeName = "character varying")]
    public string Filename { get; set; } = null!;

    [Column("size")]
    public int Size { get; set; }

    [Column("url", TypeName = "character varying")]
    public string Url { get; set; } = null!;

    [Column("proxy_url", TypeName = "character varying")]
    public string ProxyUrl { get; set; } = null!;

    [Column("height")]
    public int? Height { get; set; }

    [Column("width")]
    public int? Width { get; set; }

    [Column("content_type", TypeName = "character varying")]
    public string? ContentType { get; set; }

    [Column("message_id", TypeName = "character varying")]
    public string? MessageId { get; set; }

    [ForeignKey("MessageId")]
    [InverseProperty("Attachments")]
    public virtual Message? Message { get; set; }
}
