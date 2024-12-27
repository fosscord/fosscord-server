using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("valid_registration_tokens")]
public partial class ValidRegistrationToken
{
    [Key]
    [Column("token", TypeName = "character varying")]
    public string Token { get; set; } = null!;

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("expires_at", TypeName = "timestamp without time zone")]
    public DateTime ExpiresAt { get; set; }
}
