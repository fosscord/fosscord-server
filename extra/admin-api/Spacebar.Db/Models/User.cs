using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("users")]
[Index("SettingsIndex", Name = "REL_0c14beb78d8c5ccba66072adbc", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("username", TypeName = "character varying")]
    public string Username { get; set; } = null!;

    [Column("discriminator", TypeName = "character varying")]
    public string Discriminator { get; set; } = null!;

    [Column("avatar", TypeName = "character varying")]
    public string? Avatar { get; set; }

    [Column("accent_color")]
    public int? AccentColor { get; set; }

    [Column("banner", TypeName = "character varying")]
    public string? Banner { get; set; }

    [Column("theme_colors")]
    public string? ThemeColors { get; set; }

    [Column("pronouns", TypeName = "character varying")]
    public string? Pronouns { get; set; }

    [Column("phone", TypeName = "character varying")]
    public string? Phone { get; set; }

    [Column("desktop")]
    public bool Desktop { get; set; }

    [Column("mobile")]
    public bool Mobile { get; set; }

    [Column("premium")]
    public bool Premium { get; set; }

    [Column("premium_type")]
    public int PremiumType { get; set; }

    [Column("bot")]
    public bool Bot { get; set; }

    [Column("bio", TypeName = "character varying")]
    public string Bio { get; set; } = null!;

    [Column("system")]
    public bool System { get; set; }

    [Column("nsfw_allowed")]
    public bool NsfwAllowed { get; set; }

    [Column("mfa_enabled")]
    public bool MfaEnabled { get; set; }

    [Column("webauthn_enabled")]
    public bool WebauthnEnabled { get; set; }

    [Column("totp_secret", TypeName = "character varying")]
    public string? TotpSecret { get; set; }

    [Column("totp_last_ticket", TypeName = "character varying")]
    public string? TotpLastTicket { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("premium_since", TypeName = "timestamp without time zone")]
    public DateTime? PremiumSince { get; set; }

    [Column("verified")]
    public bool Verified { get; set; }

    [Column("disabled")]
    public bool Disabled { get; set; }

    [Column("deleted")]
    public bool Deleted { get; set; }

    [Column("email", TypeName = "character varying")]
    public string? Email { get; set; }

    [Column("flags", TypeName = "character varying")]
    public string Flags { get; set; }

    [Column("public_flags")]
    public int PublicFlags { get; set; }

    [Column("purchased_flags")]
    public int PurchasedFlags { get; set; }

    [Column("premium_usage_flags")]
    public int PremiumUsageFlags { get; set; }

    [Column("rights")]
    public long Rights { get; set; }

    [Column("data")]
    public string Data { get; set; } = null!;

    [Column("fingerprints")]
    public string Fingerprints { get; set; } = null!;

    [Column("extended_settings")]
    public string ExtendedSettings { get; set; } = null!;

    [Column("badge_ids")]
    public string? BadgeIds { get; set; }

    [Column("settingsIndex")]
    public int? SettingsIndex { get; set; }

    [InverseProperty("BotUser")]
    public virtual Application? ApplicationBotUser { get; set; }

    [InverseProperty("Owner")]
    public virtual ICollection<Application> ApplicationOwners { get; set; } = new List<Application>();

    [InverseProperty("Target")]
    public virtual ICollection<AuditLog> AuditLogTargets { get; set; } = new List<AuditLog>();

    [InverseProperty("User")]
    public virtual ICollection<AuditLog> AuditLogUsers { get; set; } = new List<AuditLog>();

    [InverseProperty("User")]
    public virtual ICollection<BackupCode> BackupCodes { get; set; } = new List<BackupCode>();

    [InverseProperty("Executor")]
    public virtual ICollection<Ban> BanExecutors { get; set; } = new List<Ban>();

    [InverseProperty("User")]
    public virtual ICollection<Ban> BanUsers { get; set; } = new List<Ban>();

    [InverseProperty("Owner")]
    public virtual ICollection<Channel> Channels { get; set; } = new List<Channel>();

    [InverseProperty("User")]
    public virtual ICollection<ConnectedAccount> ConnectedAccounts { get; set; } = new List<ConnectedAccount>();

    [InverseProperty("User")]
    public virtual ICollection<Emoji> Emojis { get; set; } = new List<Emoji>();

    [InverseProperty("Owner")]
    public virtual ICollection<Guild> Guilds { get; set; } = new List<Guild>();

    [InverseProperty("Inviter")]
    public virtual ICollection<Invite> InviteInviters { get; set; } = new List<Invite>();

    [InverseProperty("TargetUser")]
    public virtual ICollection<Invite> InviteTargetUsers { get; set; } = new List<Invite>();

    [InverseProperty("IdNavigation")]
    public virtual ICollection<Member> Members { get; set; } = new List<Member>();

    [InverseProperty("Author")]
    public virtual ICollection<Message> MessageAuthors { get; set; } = new List<Message>();

    [InverseProperty("Member")]
    public virtual ICollection<Message> MessageMembers { get; set; } = new List<Message>();

    [InverseProperty("Owner")]
    public virtual ICollection<Note> NoteOwners { get; set; } = new List<Note>();

    [InverseProperty("Target")]
    public virtual ICollection<Note> NoteTargets { get; set; } = new List<Note>();

    [InverseProperty("User")]
    public virtual ICollection<ReadState> ReadStates { get; set; } = new List<ReadState>();

    [InverseProperty("User")]
    public virtual ICollection<Recipient> Recipients { get; set; } = new List<Recipient>();

    [InverseProperty("From")]
    public virtual ICollection<Relationship> RelationshipFroms { get; set; } = new List<Relationship>();

    [InverseProperty("To")]
    public virtual ICollection<Relationship> RelationshipTos { get; set; } = new List<Relationship>();

    [InverseProperty("User")]
    public virtual ICollection<SecurityKey> SecurityKeys { get; set; } = new List<SecurityKey>();

    [InverseProperty("User")]
    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    [ForeignKey("SettingsIndex")]
    [InverseProperty("User")]
    public virtual UserSetting? SettingsIndexNavigation { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Sticker> Stickers { get; set; } = new List<Sticker>();

    [InverseProperty("User")]
    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();

    [InverseProperty("OwnerUser")]
    public virtual ICollection<Team> Teams { get; set; } = new List<Team>();

    [InverseProperty("Creator")]
    public virtual ICollection<Template> Templates { get; set; } = new List<Template>();

    [InverseProperty("User")]
    public virtual ICollection<VoiceState> VoiceStates { get; set; } = new List<VoiceState>();

    [InverseProperty("User")]
    public virtual ICollection<Webhook> Webhooks { get; set; } = new List<Webhook>();

    [ForeignKey("UsersId")]
    [InverseProperty("Users")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}
