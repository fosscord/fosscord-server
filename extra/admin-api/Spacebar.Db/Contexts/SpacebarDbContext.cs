using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Spacebar.Db.Models;

namespace Spacebar.Db.Contexts;

public partial class SpacebarDbContext : DbContext
{
    public SpacebarDbContext(DbContextOptions<SpacebarDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Application> Applications { get; set; }

    public virtual DbSet<Attachment> Attachments { get; set; }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<BackupCode> BackupCodes { get; set; }

    public virtual DbSet<Badge> Badges { get; set; }

    public virtual DbSet<Ban> Bans { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Channel> Channels { get; set; }

    public virtual DbSet<ClientRelease> ClientReleases { get; set; }

    public virtual DbSet<Config> Configs { get; set; }

    public virtual DbSet<ConnectedAccount> ConnectedAccounts { get; set; }

    public virtual DbSet<ConnectionConfig> ConnectionConfigs { get; set; }

    public virtual DbSet<EmbedCache> EmbedCaches { get; set; }

    public virtual DbSet<Emoji> Emojis { get; set; }

    public virtual DbSet<Guild> Guilds { get; set; }

    public virtual DbSet<Invite> Invites { get; set; }

    public virtual DbSet<Member> Members { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<Migration> Migrations { get; set; }

    public virtual DbSet<Note> Notes { get; set; }

    public virtual DbSet<RateLimit> RateLimits { get; set; }

    public virtual DbSet<ReadState> ReadStates { get; set; }

    public virtual DbSet<Recipient> Recipients { get; set; }

    public virtual DbSet<Relationship> Relationships { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<SecurityKey> SecurityKeys { get; set; }

    public virtual DbSet<SecuritySetting> SecuritySettings { get; set; }

    public virtual DbSet<Session> Sessions { get; set; }

    public virtual DbSet<Sticker> Stickers { get; set; }

    public virtual DbSet<StickerPack> StickerPacks { get; set; }

    public virtual DbSet<Team> Teams { get; set; }

    public virtual DbSet<TeamMember> TeamMembers { get; set; }

    public virtual DbSet<Template> Templates { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserSetting> UserSettings { get; set; }

    public virtual DbSet<ValidRegistrationToken> ValidRegistrationTokens { get; set; }

    public virtual DbSet<VoiceState> VoiceStates { get; set; }

    public virtual DbSet<Webhook> Webhooks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Application>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_938c0a27255637bde919591888f");

            entity.HasOne(d => d.BotUser).WithOne(p => p.ApplicationBotUser)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_2ce5a55796fe4c2f77ece57a647");

            entity.HasOne(d => d.Guild).WithMany(p => p.Applications).HasConstraintName("FK_e5bf78cdbbe9ba91062d74c5aba");

            entity.HasOne(d => d.Owner).WithMany(p => p.ApplicationOwners)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_e57508958bf92b9d9d25231b5e8");

            entity.HasOne(d => d.Team).WithMany(p => p.Applications)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_a36ed02953077f408d0f3ebc424");
        });

        modelBuilder.Entity<Attachment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_5e1f050bcff31e3084a1d662412");

            entity.HasOne(d => d.Message).WithMany(p => p.Attachments)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_623e10eec51ada466c5038979e3");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_1bb179d048bbc581caa3b013439");

            entity.HasOne(d => d.Target).WithMany(p => p.AuditLogTargets).HasConstraintName("FK_3cd01cd3ae7aab010310d96ac8e");

            entity.HasOne(d => d.User).WithMany(p => p.AuditLogUsers).HasConstraintName("FK_bd2726fd31b35443f2245b93ba0");
        });

        modelBuilder.Entity<BackupCode>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_34ab957382dbc57e8fb53f1638f");

            entity.HasOne(d => d.User).WithMany(p => p.BackupCodes)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_70066ea80d2f4b871beda32633b");
        });

        modelBuilder.Entity<Badge>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_8a651318b8de577e8e217676466");
        });

        modelBuilder.Entity<Ban>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_a4d6f261bffa4615c62d756566a");

            entity.HasOne(d => d.Executor).WithMany(p => p.BanExecutors).HasConstraintName("FK_07ad88c86d1f290d46748410d58");

            entity.HasOne(d => d.Guild).WithMany(p => p.Bans)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_9d3ab7dd180ebdd245cdb66ecad");

            entity.HasOne(d => d.User).WithMany(p => p.BanUsers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_5999e8e449f80a236ff72023559");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_24dbc6126a28ff948da33e97d3b");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<Channel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_bc603823f3f741359c2339389f9");

            entity.HasOne(d => d.Guild).WithMany(p => p.Channels)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_c253dafe5f3a03ec00cd8fb4581");

            entity.HasOne(d => d.Owner).WithMany(p => p.Channels).HasConstraintName("FK_3873ed438575cce703ecff4fc7b");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent).HasConstraintName("FK_3274522d14af40540b1a883fc80");
        });

        modelBuilder.Entity<ClientRelease>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_4c4ea258342d2d6ba1be0a71a43");
        });

        modelBuilder.Entity<Config>(entity =>
        {
            entity.HasKey(e => e.Key).HasName("PK_26489c99ddbb4c91631ef5cc791");
        });

        modelBuilder.Entity<ConnectedAccount>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_70416f1da0be645bb31da01c774");

            entity.HasOne(d => d.User).WithMany(p => p.ConnectedAccounts)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_f47244225a6a1eac04a3463dd90");
        });

        modelBuilder.Entity<ConnectionConfig>(entity =>
        {
            entity.HasKey(e => e.Key).HasName("PK_bc0554f736ad71dde346549488a");
        });

        modelBuilder.Entity<EmbedCache>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_0abb7581d4efc5a8b1361389c5e");
        });

        modelBuilder.Entity<Emoji>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_9adb96a675f555c6169bad7ba62");

            entity.HasOne(d => d.Guild).WithMany(p => p.Emojis).HasConstraintName("FK_4b988e0db89d94cebcf07f598cc");

            entity.HasOne(d => d.User).WithMany(p => p.Emojis).HasConstraintName("FK_fa7ddd5f9a214e28ce596548421");
        });

        modelBuilder.Entity<Guild>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_e7e7f2a51bd6d96a9ac2aa560f9");

            entity.HasOne(d => d.AfkChannel).WithMany(p => p.GuildAfkChannels).HasConstraintName("FK_f591a66b8019d87b0fe6c12dad6");

            entity.HasOne(d => d.Owner).WithMany(p => p.Guilds).HasConstraintName("FK_fc1a451727e3643ca572a3bb394");

            entity.HasOne(d => d.PublicUpdatesChannel).WithMany(p => p.GuildPublicUpdatesChannels).HasConstraintName("FK_8d450b016dc8bec35f36729e4b0");

            entity.HasOne(d => d.RulesChannel).WithMany(p => p.GuildRulesChannels).HasConstraintName("FK_95828668aa333460582e0ca6396");

            entity.HasOne(d => d.SystemChannel).WithMany(p => p.GuildSystemChannels).HasConstraintName("FK_cfc3d3ad260f8121c95b31a1fce");

            entity.HasOne(d => d.Template).WithMany(p => p.Guilds).HasConstraintName("FK_e2a2f873a64a5cf62526de42325");

            entity.HasOne(d => d.WidgetChannel).WithMany(p => p.GuildWidgetChannels).HasConstraintName("FK_9d1d665379eefde7876a17afa99");
        });

        modelBuilder.Entity<Invite>(entity =>
        {
            entity.HasKey(e => e.Code).HasName("PK_33fd8a248db1cd832baa8aa25bf");

            entity.HasOne(d => d.Channel).WithMany(p => p.Invites)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_6a15b051fe5050aa00a4b9ff0f6");

            entity.HasOne(d => d.Guild).WithMany(p => p.Invites)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_3f4939aa1461e8af57fea3fb05d");

            entity.HasOne(d => d.Inviter).WithMany(p => p.InviteInviters)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_15c35422032e0b22b4ada95f48f");

            entity.HasOne(d => d.TargetUser).WithMany(p => p.InviteTargetUsers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_11a0d394f8fc649c19ce5f16b59");
        });

        modelBuilder.Entity<Member>(entity =>
        {
            entity.HasKey(e => e.Index).HasName("PK_b4a6b8c2478e5df990909c6cf6a");

            entity.HasOne(d => d.Guild).WithMany(p => p.Members).HasConstraintName("FK_16aceddd5b89825b8ed6029ad1c");

            entity.HasOne(d => d.IdNavigation).WithMany(p => p.Members).HasConstraintName("FK_28b53062261b996d9c99fa12404");

            entity.HasMany(d => d.Roles).WithMany(p => p.Indices)
                .UsingEntity<Dictionary<string, object>>(
                    "MemberRole",
                    r => r.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .HasConstraintName("FK_e9080e7a7997a0170026d5139c1"),
                    l => l.HasOne<Member>().WithMany()
                        .HasForeignKey("Index")
                        .HasConstraintName("FK_5d7ddc8a5f9c167f548625e772e"),
                    j =>
                    {
                        j.HasKey("Index", "RoleId").HasName("PK_951c1d72a0fd1da8760b4a1fd66");
                        j.ToTable("member_roles");
                        j.HasIndex(new[] { "Index" }, "IDX_5d7ddc8a5f9c167f548625e772");
                        j.HasIndex(new[] { "RoleId" }, "IDX_e9080e7a7997a0170026d5139c");
                        j.IndexerProperty<int>("Index").HasColumnName("index");
                        j.IndexerProperty<string>("RoleId")
                            .HasColumnType("character varying")
                            .HasColumnName("role_id");
                    });
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_18325f38ae6de43878487eff986");

            entity.Property(e => e.Flags).HasDefaultValue(0);
            entity.Property(e => e.Timestamp).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Application).WithMany(p => p.Messages).HasConstraintName("FK_5d3ec1cb962de6488637fd779d6");

            entity.HasOne(d => d.Author).WithMany(p => p.MessageAuthors)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_05535bc695e9f7ee104616459d3");

            entity.HasOne(d => d.Channel).WithMany(p => p.Messages)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_86b9109b155eb70c0a2ca3b4b6d");

            entity.HasOne(d => d.Guild).WithMany(p => p.Messages)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_b193588441b085352a4c0109423");

            entity.HasOne(d => d.Member).WithMany(p => p.MessageMembers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_b0525304f2262b7014245351c76");

            entity.HasOne(d => d.MessageReferenceNavigation).WithMany(p => p.InverseMessageReferenceNavigation).HasConstraintName("FK_61a92bb65b302a76d9c1fcd3174");

            entity.HasOne(d => d.Webhook).WithMany(p => p.Messages).HasConstraintName("FK_f83c04bcf1df4e5c0e7a52ed348");

            entity.HasMany(d => d.Channels).WithMany(p => p.MessagesNavigation)
                .UsingEntity<Dictionary<string, object>>(
                    "MessageChannelMention",
                    r => r.HasOne<Channel>().WithMany()
                        .HasForeignKey("ChannelsId")
                        .HasConstraintName("FK_bdb8c09e1464cabf62105bf4b9d"),
                    l => l.HasOne<Message>().WithMany()
                        .HasForeignKey("MessagesId")
                        .HasConstraintName("FK_2a27102ecd1d81b4582a4360921"),
                    j =>
                    {
                        j.HasKey("MessagesId", "ChannelsId").HasName("PK_85cb45351497cd9d06a79ced65e");
                        j.ToTable("message_channel_mentions");
                        j.HasIndex(new[] { "MessagesId" }, "IDX_2a27102ecd1d81b4582a436092");
                        j.HasIndex(new[] { "ChannelsId" }, "IDX_bdb8c09e1464cabf62105bf4b9");
                        j.IndexerProperty<string>("MessagesId")
                            .HasColumnType("character varying")
                            .HasColumnName("messagesId");
                        j.IndexerProperty<string>("ChannelsId")
                            .HasColumnType("character varying")
                            .HasColumnName("channelsId");
                    });

            entity.HasMany(d => d.Roles).WithMany(p => p.Messages)
                .UsingEntity<Dictionary<string, object>>(
                    "MessageRoleMention",
                    r => r.HasOne<Role>().WithMany()
                        .HasForeignKey("RolesId")
                        .HasConstraintName("FK_29d63eb1a458200851bc37d074b"),
                    l => l.HasOne<Message>().WithMany()
                        .HasForeignKey("MessagesId")
                        .HasConstraintName("FK_a8242cf535337a490b0feaea0b4"),
                    j =>
                    {
                        j.HasKey("MessagesId", "RolesId").HasName("PK_74dba92cc300452a6e14b83ed44");
                        j.ToTable("message_role_mentions");
                        j.HasIndex(new[] { "RolesId" }, "IDX_29d63eb1a458200851bc37d074");
                        j.HasIndex(new[] { "MessagesId" }, "IDX_a8242cf535337a490b0feaea0b");
                        j.IndexerProperty<string>("MessagesId")
                            .HasColumnType("character varying")
                            .HasColumnName("messagesId");
                        j.IndexerProperty<string>("RolesId")
                            .HasColumnType("character varying")
                            .HasColumnName("rolesId");
                    });

            entity.HasMany(d => d.Stickers).WithMany(p => p.Messages)
                .UsingEntity<Dictionary<string, object>>(
                    "MessageSticker",
                    r => r.HasOne<Sticker>().WithMany()
                        .HasForeignKey("StickersId")
                        .HasConstraintName("FK_e22a70819d07659c7a71c112a1f"),
                    l => l.HasOne<Message>().WithMany()
                        .HasForeignKey("MessagesId")
                        .HasConstraintName("FK_40bb6f23e7cc133292e92829d28"),
                    j =>
                    {
                        j.HasKey("MessagesId", "StickersId").HasName("PK_ed820c4093d0b8cd1d2bcf66087");
                        j.ToTable("message_stickers");
                        j.HasIndex(new[] { "MessagesId" }, "IDX_40bb6f23e7cc133292e92829d2");
                        j.HasIndex(new[] { "StickersId" }, "IDX_e22a70819d07659c7a71c112a1");
                        j.IndexerProperty<string>("MessagesId")
                            .HasColumnType("character varying")
                            .HasColumnName("messagesId");
                        j.IndexerProperty<string>("StickersId")
                            .HasColumnType("character varying")
                            .HasColumnName("stickersId");
                    });

            entity.HasMany(d => d.Users).WithMany(p => p.Messages)
                .UsingEntity<Dictionary<string, object>>(
                    "MessageUserMention",
                    r => r.HasOne<User>().WithMany()
                        .HasForeignKey("UsersId")
                        .HasConstraintName("FK_b831eb18ceebd28976239b1e2f8"),
                    l => l.HasOne<Message>().WithMany()
                        .HasForeignKey("MessagesId")
                        .HasConstraintName("FK_a343387fc560ef378760681c236"),
                    j =>
                    {
                        j.HasKey("MessagesId", "UsersId").HasName("PK_9b9b6e245ad47a48dbd7605d4fb");
                        j.ToTable("message_user_mentions");
                        j.HasIndex(new[] { "MessagesId" }, "IDX_a343387fc560ef378760681c23");
                        j.HasIndex(new[] { "UsersId" }, "IDX_b831eb18ceebd28976239b1e2f");
                        j.IndexerProperty<string>("MessagesId")
                            .HasColumnType("character varying")
                            .HasColumnName("messagesId");
                        j.IndexerProperty<string>("UsersId")
                            .HasColumnType("character varying")
                            .HasColumnName("usersId");
                    });
        });

        modelBuilder.Entity<Migration>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_8c82d7f526340ab734260ea46be");
        });

        modelBuilder.Entity<Note>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_af6206538ea96c4e77e9f400c3d");

            entity.HasOne(d => d.Owner).WithMany(p => p.NoteOwners)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_f9e103f8ae67cb1787063597925");

            entity.HasOne(d => d.Target).WithMany(p => p.NoteTargets)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_23e08e5b4481711d573e1abecdc");
        });

        modelBuilder.Entity<RateLimit>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_3b4449f1f5fc167d921ee619f65");
        });

        modelBuilder.Entity<ReadState>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_e6956a804978f01b713b1ed58e2");

            entity.HasOne(d => d.Channel).WithMany(p => p.ReadStates).HasConstraintName("FK_40da2fca4e0eaf7a23b5bfc5d34");

            entity.HasOne(d => d.User).WithMany(p => p.ReadStates).HasConstraintName("FK_195f92e4dd1254a4e348c043763");
        });

        modelBuilder.Entity<Recipient>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_de8fc5a9c364568f294798fe1e9");

            entity.Property(e => e.Closed).HasDefaultValue(false);

            entity.HasOne(d => d.Channel).WithMany(p => p.Recipients).HasConstraintName("FK_2f18ee1ba667f233ae86c0ea60e");

            entity.HasOne(d => d.User).WithMany(p => p.Recipients).HasConstraintName("FK_6157e8b6ba4e6e3089616481fe2");
        });

        modelBuilder.Entity<Relationship>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_ba20e2f5cf487408e08e4dcecaf");

            entity.HasOne(d => d.From).WithMany(p => p.RelationshipFroms).HasConstraintName("FK_9af4194bab1250b1c584ae4f1d7");

            entity.HasOne(d => d.To).WithMany(p => p.RelationshipTos).HasConstraintName("FK_9c7f6b98a9843b76dce1b0c878b");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_c1433d71a4838793a49dcad46ab");

            entity.Property(e => e.Flags).HasDefaultValue(0);

            entity.HasOne(d => d.Guild).WithMany(p => p.Roles).HasConstraintName("FK_c32c1ab1c4dc7dcb0278c4b1b8b");
        });

        modelBuilder.Entity<SecurityKey>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_6e95cdd91779e7cca06d1fff89c");

            entity.HasOne(d => d.User).WithMany(p => p.SecurityKeys)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_24c97d0771cafedce6d7163eaad");
        });

        modelBuilder.Entity<SecuritySetting>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_4aec436cf81177ae97a1bcec3c7");
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_3238ef96f18b355b671619111bc");

            entity.HasOne(d => d.User).WithMany(p => p.Sessions)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_085d540d9f418cfbdc7bd55bb19");
        });

        modelBuilder.Entity<Sticker>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_e1dafa4063a5532645cc2810374");

            entity.HasOne(d => d.Guild).WithMany(p => p.Stickers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_193d551d852aca5347ef5c9f205");

            entity.HasOne(d => d.Pack).WithMany(p => p.Stickers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_e7cfa5cefa6661b3fb8fda8ce69");

            entity.HasOne(d => d.User).WithMany(p => p.Stickers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_8f4ee73f2bb2325ff980502e158");
        });

        modelBuilder.Entity<StickerPack>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_a27381efea0f876f5d3233af655");

            entity.HasOne(d => d.CoverStickerId1Navigation).WithMany(p => p.StickerPacks).HasConstraintName("FK_448fafba4355ee1c837bbc865f1");
        });

        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_7e5523774a38b08a6236d322403");

            entity.HasOne(d => d.OwnerUser).WithMany(p => p.Teams).HasConstraintName("FK_13f00abf7cb6096c43ecaf8c108");
        });

        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_ca3eae89dcf20c9fd95bf7460aa");

            entity.HasOne(d => d.Team).WithMany(p => p.TeamMembers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_fdad7d5768277e60c40e01cdcea");

            entity.HasOne(d => d.User).WithMany(p => p.TeamMembers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_c2bf4967c8c2a6b845dadfbf3d4");
        });

        modelBuilder.Entity<Template>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_515948649ce0bbbe391de702ae5");

            entity.HasOne(d => d.Creator).WithMany(p => p.Templates).HasConstraintName("FK_d7374b7f8f5fbfdececa4fb62e1");

            entity.HasOne(d => d.SourceGuild).WithMany(p => p.Templates)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_445d00eaaea0e60a017a5ed0c11");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_a3ffb1c0c8416b9fc6f907b7433");

            entity.Property(e => e.WebauthnEnabled).HasDefaultValue(false);

            entity.HasOne(d => d.SettingsIndexNavigation).WithOne(p => p.User).HasConstraintName("FK_0c14beb78d8c5ccba66072adbc7");
        });

        modelBuilder.Entity<UserSetting>(entity =>
        {
            entity.HasKey(e => e.Index).HasName("PK_e81f8bb92802737337d35c00981");
        });

        modelBuilder.Entity<ValidRegistrationToken>(entity =>
        {
            entity.HasKey(e => e.Token).HasName("PK_e0f5c8e3fcefe3134a092c50485");
        });

        modelBuilder.Entity<VoiceState>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_ada09a50c134fad1369b510e3ce");

            entity.HasOne(d => d.Channel).WithMany(p => p.VoiceStates)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_9f8d389866b40b6657edd026dd4");

            entity.HasOne(d => d.Guild).WithMany(p => p.VoiceStates)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_03779ef216d4b0358470d9cb748");

            entity.HasOne(d => d.User).WithMany(p => p.VoiceStates)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_5fe1d5f931a67e85039c640001b");
        });

        modelBuilder.Entity<Webhook>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_9e8795cfc899ab7bdaa831e8527");

            entity.HasOne(d => d.Application).WithMany(p => p.Webhooks)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_c3e5305461931763b56aa905f1c");

            entity.HasOne(d => d.Channel).WithMany(p => p.WebhookChannels)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_df528cf77e82f8032230e7e37d8");

            entity.HasOne(d => d.Guild).WithMany(p => p.WebhookGuilds)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_487a7af59d189f744fe394368fc");

            entity.HasOne(d => d.SourceChannel).WithMany(p => p.WebhookSourceChannels)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_4495b7032a33c6b8b605d030398");

            entity.HasOne(d => d.SourceGuild).WithMany(p => p.WebhookSourceGuilds)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_3a285f4f49c40e0706d3018bc9f");

            entity.HasOne(d => d.User).WithMany(p => p.Webhooks)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_0d523f6f997c86e052c49b1455f");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
