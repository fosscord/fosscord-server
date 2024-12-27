using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("messages")]
[Index("AuthorId", Name = "IDX_05535bc695e9f7ee104616459d")]
[Index("ChannelId", "Id", Name = "IDX_3ed7a60fb7dbe04e1ba9332a8b", IsUnique = true)]
[Index("ChannelId", Name = "IDX_86b9109b155eb70c0a2ca3b4b6")]
public partial class Message
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("channel_id", TypeName = "character varying")]
    public string? ChannelId { get; set; }

    [Column("guild_id", TypeName = "character varying")]
    public string? GuildId { get; set; }

    [Column("author_id", TypeName = "character varying")]
    public string? AuthorId { get; set; }

    [Column("member_id", TypeName = "character varying")]
    public string? MemberId { get; set; }

    [Column("webhook_id", TypeName = "character varying")]
    public string? WebhookId { get; set; }

    [Column("application_id", TypeName = "character varying")]
    public string? ApplicationId { get; set; }

    [Column("content", TypeName = "character varying")]
    public string? Content { get; set; }

    [Column("timestamp", TypeName = "timestamp without time zone")]
    public DateTime Timestamp { get; set; }

    [Column("edited_timestamp", TypeName = "timestamp without time zone")]
    public DateTime? EditedTimestamp { get; set; }

    [Column("tts")]
    public bool? Tts { get; set; }

    [Column("mention_everyone")]
    public bool? MentionEveryone { get; set; }

    [Column("embeds")]
    public string Embeds { get; set; } = null!;

    [Column("reactions")]
    public string Reactions { get; set; } = null!;

    [Column("nonce")]
    public string? Nonce { get; set; }

    [Column("pinned")]
    public bool? Pinned { get; set; }

    [Column("type")]
    public int Type { get; set; }

    [Column("activity")]
    public string? Activity { get; set; }

    [Column("flags")]
    public int Flags { get; set; }

    [Column("message_reference")]
    public string? MessageReference { get; set; }

    [Column("interaction")]
    public string? Interaction { get; set; }

    [Column("components")]
    public string? Components { get; set; }

    [Column("poll")]
    public string? Poll { get; set; }

    [Column("username", TypeName = "character varying")]
    public string? Username { get; set; }

    [Column("avatar", TypeName = "character varying")]
    public string? Avatar { get; set; }

    [Column("message_reference_id", TypeName = "character varying")]
    public string? MessageReferenceId { get; set; }

    [ForeignKey("ApplicationId")]
    [InverseProperty("Messages")]
    public virtual Application? Application { get; set; }

    [InverseProperty("Message")]
    public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();

    [ForeignKey("AuthorId")]
    [InverseProperty("MessageAuthors")]
    public virtual User? Author { get; set; }

    [ForeignKey("ChannelId")]
    [InverseProperty("Messages")]
    public virtual Channel? Channel { get; set; }

    [ForeignKey("GuildId")]
    [InverseProperty("Messages")]
    public virtual Guild? Guild { get; set; }

    [InverseProperty("MessageReferenceNavigation")]
    public virtual ICollection<Message> InverseMessageReferenceNavigation { get; set; } = new List<Message>();

    [ForeignKey("MemberId")]
    [InverseProperty("MessageMembers")]
    public virtual User? Member { get; set; }

    [ForeignKey("MessageReferenceId")]
    [InverseProperty("InverseMessageReferenceNavigation")]
    public virtual Message? MessageReferenceNavigation { get; set; }

    [ForeignKey("WebhookId")]
    [InverseProperty("Messages")]
    public virtual Webhook? Webhook { get; set; }

    [ForeignKey("MessagesId")]
    [InverseProperty("MessagesNavigation")]
    public virtual ICollection<Channel> Channels { get; set; } = new List<Channel>();

    [ForeignKey("MessagesId")]
    [InverseProperty("Messages")]
    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();

    [ForeignKey("MessagesId")]
    [InverseProperty("Messages")]
    public virtual ICollection<Sticker> Stickers { get; set; } = new List<Sticker>();

    [ForeignKey("MessagesId")]
    [InverseProperty("Messages")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
