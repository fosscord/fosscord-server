using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("connected_accounts")]
public partial class ConnectedAccount
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("external_id", TypeName = "character varying")]
    public string ExternalId { get; set; } = null!;

    [Column("user_id", TypeName = "character varying")]
    public string? UserId { get; set; }

    [Column("friend_sync")]
    public bool FriendSync { get; set; }

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("revoked")]
    public bool Revoked { get; set; }

    [Column("show_activity")]
    public int ShowActivity { get; set; }

    [Column("type", TypeName = "character varying")]
    public string Type { get; set; } = null!;

    [Column("verified")]
    public bool Verified { get; set; }

    [Column("visibility")]
    public int Visibility { get; set; }

    [Column("integrations")]
    public string Integrations { get; set; } = null!;

    [Column("metadata")]
    public string? Metadata { get; set; }

    [Column("metadata_visibility")]
    public int MetadataVisibility { get; set; }

    [Column("two_way_link")]
    public bool TwoWayLink { get; set; }

    [Column("token_data")]
    public string? TokenData { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("ConnectedAccounts")]
    public virtual User? User { get; set; }
}
