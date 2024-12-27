using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("user_settings")]
public partial class UserSetting
{
    [Key]
    [Column("index")]
    public int Index { get; set; }

    [Column("afk_timeout")]
    public int? AfkTimeout { get; set; }

    [Column("allow_accessibility_detection")]
    public bool? AllowAccessibilityDetection { get; set; }

    [Column("animate_emoji")]
    public bool? AnimateEmoji { get; set; }

    [Column("animate_stickers")]
    public int? AnimateStickers { get; set; }

    [Column("contact_sync_enabled")]
    public bool? ContactSyncEnabled { get; set; }

    [Column("convert_emoticons")]
    public bool? ConvertEmoticons { get; set; }

    [Column("custom_status")]
    public string? CustomStatus { get; set; }

    [Column("default_guilds_restricted")]
    public bool? DefaultGuildsRestricted { get; set; }

    [Column("detect_platform_accounts")]
    public bool? DetectPlatformAccounts { get; set; }

    [Column("developer_mode")]
    public bool? DeveloperMode { get; set; }

    [Column("disable_games_tab")]
    public bool? DisableGamesTab { get; set; }

    [Column("enable_tts_command")]
    public bool? EnableTtsCommand { get; set; }

    [Column("explicit_content_filter")]
    public int? ExplicitContentFilter { get; set; }

    [Column("friend_discovery_flags")]
    public int? FriendDiscoveryFlags { get; set; }

    [Column("friend_source_flags")]
    public string? FriendSourceFlags { get; set; }

    [Column("gateway_connected")]
    public bool? GatewayConnected { get; set; }

    [Column("gif_auto_play")]
    public bool? GifAutoPlay { get; set; }

    [Column("guild_folders")]
    public string? GuildFolders { get; set; }

    [Column("guild_positions")]
    public string? GuildPositions { get; set; }

    [Column("inline_attachment_media")]
    public bool? InlineAttachmentMedia { get; set; }

    [Column("inline_embed_media")]
    public bool? InlineEmbedMedia { get; set; }

    [Column("locale", TypeName = "character varying")]
    public string? Locale { get; set; }

    [Column("message_display_compact")]
    public bool? MessageDisplayCompact { get; set; }

    [Column("native_phone_integration_enabled")]
    public bool? NativePhoneIntegrationEnabled { get; set; }

    [Column("render_embeds")]
    public bool? RenderEmbeds { get; set; }

    [Column("render_reactions")]
    public bool? RenderReactions { get; set; }

    [Column("restricted_guilds")]
    public string? RestrictedGuilds { get; set; }

    [Column("show_current_game")]
    public bool? ShowCurrentGame { get; set; }

    [Column("status", TypeName = "character varying")]
    public string? Status { get; set; }

    [Column("stream_notifications_enabled")]
    public bool? StreamNotificationsEnabled { get; set; }

    [Column("theme", TypeName = "character varying")]
    public string? Theme { get; set; }

    [Column("timezone_offset")]
    public int? TimezoneOffset { get; set; }

    [Column("view_nsfw_guilds")]
    public bool? ViewNsfwGuilds { get; set; }

    [InverseProperty("SettingsIndexNavigation")]
    public virtual User? User { get; set; }
}
