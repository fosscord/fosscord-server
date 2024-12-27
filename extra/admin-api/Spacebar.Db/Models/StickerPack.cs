using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("sticker_packs")]
public partial class StickerPack
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("description", TypeName = "character varying")]
    public string? Description { get; set; }

    [Column("banner_asset_id", TypeName = "character varying")]
    public string? BannerAssetId { get; set; }

    [Column("cover_sticker_id", TypeName = "character varying")]
    public string? CoverStickerId { get; set; }

    [Column("coverStickerId", TypeName = "character varying")]
    public string? CoverStickerId1 { get; set; }

    [ForeignKey("CoverStickerId1")]
    [InverseProperty("StickerPacks")]
    public virtual Sticker? CoverStickerId1Navigation { get; set; }

    [InverseProperty("Pack")]
    public virtual ICollection<Sticker> Stickers { get; set; } = new List<Sticker>();
}
