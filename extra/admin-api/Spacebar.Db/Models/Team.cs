using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("teams")]
public partial class Team
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("icon", TypeName = "character varying")]
    public string? Icon { get; set; }

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("owner_user_id", TypeName = "character varying")]
    public string? OwnerUserId { get; set; }

    [InverseProperty("Team")]
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    [ForeignKey("OwnerUserId")]
    [InverseProperty("Teams")]
    public virtual User? OwnerUser { get; set; }

    [InverseProperty("Team")]
    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();
}
