using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("read_states")]
[Index("ChannelId", "UserId", Name = "IDX_0abf8b443321bd3cf7f81ee17a", IsUnique = true)]
public partial class ReadState
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("channel_id", TypeName = "character varying")]
    public string ChannelId { get; set; } = null!;

    [Column("user_id", TypeName = "character varying")]
    public string UserId { get; set; } = null!;

    [Column("last_message_id", TypeName = "character varying")]
    public string? LastMessageId { get; set; }

    [Column("public_ack", TypeName = "character varying")]
    public string? PublicAck { get; set; }

    [Column("notifications_cursor", TypeName = "character varying")]
    public string? NotificationsCursor { get; set; }

    [Column("last_pin_timestamp", TypeName = "timestamp without time zone")]
    public DateTime? LastPinTimestamp { get; set; }

    [Column("mention_count")]
    public int? MentionCount { get; set; }

    [ForeignKey("ChannelId")]
    [InverseProperty("ReadStates")]
    public virtual Channel Channel { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("ReadStates")]
    public virtual User User { get; set; } = null!;
}
