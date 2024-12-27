using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("security_settings")]
public partial class SecuritySetting
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("guild_id", TypeName = "character varying")]
    public string? GuildId { get; set; }

    [Column("channel_id", TypeName = "character varying")]
    public string? ChannelId { get; set; }

    [Column("encryption_permission_mask")]
    public int EncryptionPermissionMask { get; set; }

    [Column("allowed_algorithms")]
    public string AllowedAlgorithms { get; set; } = null!;

    [Column("current_algorithm", TypeName = "character varying")]
    public string CurrentAlgorithm { get; set; } = null!;

    [Column("used_since_message", TypeName = "character varying")]
    public string? UsedSinceMessage { get; set; }
}
