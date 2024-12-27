using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("security_keys")]
public partial class SecurityKey
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("user_id", TypeName = "character varying")]
    public string? UserId { get; set; }

    [Column("key_id", TypeName = "character varying")]
    public string KeyId { get; set; } = null!;

    [Column("public_key", TypeName = "character varying")]
    public string PublicKey { get; set; } = null!;

    [Column("counter")]
    public int Counter { get; set; }

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("SecurityKeys")]
    public virtual User? User { get; set; }
}
