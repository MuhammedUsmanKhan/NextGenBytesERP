IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Permissions] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(256) NOT NULL,
    [Description] nvarchar(512) NULL,
    CONSTRAINT [PK_Permissions] PRIMARY KEY ([Id])
);

CREATE TABLE [RefreshTokens] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [TokenHash] nvarchar(256) NOT NULL,
    [DeviceInfo] nvarchar(512) NULL,
    [CreatedAtUtc] datetime2 NOT NULL,
    [ExpiresAtUtc] datetime2 NOT NULL,
    [RevokedAtUtc] datetime2 NULL,
    [ReplacedByTokenId] uniqueidentifier NULL,
    [IsUsed] bit NOT NULL,
    [CreatedByIp] nvarchar(64) NULL,
    [RevokedByIp] nvarchar(64) NULL,
    [ReasonRevoked] nvarchar(512) NULL,
    CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id])
);

CREATE TABLE [Roles] (
    [Id] uniqueidentifier NOT NULL,
    [Description] nvarchar(512) NULL,
    [Name] nvarchar(256) NULL,
    [NormalizedName] nvarchar(256) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
);

CREATE TABLE [Users] (
    [Id] uniqueidentifier NOT NULL,
    [UserName] nvarchar(256) NULL,
    [NormalizedUserName] nvarchar(256) NULL,
    [Email] nvarchar(256) NULL,
    [NormalizedEmail] nvarchar(256) NULL,
    [EmailConfirmed] bit NOT NULL,
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [PhoneNumberConfirmed] bit NOT NULL,
    [TwoFactorEnabled] bit NOT NULL,
    [LockoutEnd] datetimeoffset NULL,
    [LockoutEnabled] bit NOT NULL,
    [AccessFailedCount] int NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);

CREATE TABLE [RolePermissions] (
    [RoleId] uniqueidentifier NOT NULL,
    [PermissionId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_RolePermissions] PRIMARY KEY ([RoleId], [PermissionId]),
    CONSTRAINT [FK_RolePermissions_Permissions_PermissionId] FOREIGN KEY ([PermissionId]) REFERENCES [Permissions] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [RoleClaims] (
    [Id] int NOT NULL IDENTITY,
    [RoleId] uniqueidentifier NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_RoleClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_RoleClaims_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [UserClaims] (
    [Id] int NOT NULL IDENTITY,
    [UserId] uniqueidentifier NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_UserClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_UserClaims_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [UserLogins] (
    [LoginProvider] nvarchar(450) NOT NULL,
    [ProviderKey] nvarchar(450) NOT NULL,
    [ProviderDisplayName] nvarchar(max) NULL,
    [UserId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_UserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
    CONSTRAINT [FK_UserLogins_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [UserRoles] (
    [UserId] uniqueidentifier NOT NULL,
    [RoleId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_UserRoles] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_UserRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserRoles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [UserTokens] (
    [UserId] uniqueidentifier NOT NULL,
    [LoginProvider] nvarchar(450) NOT NULL,
    [Name] nvarchar(450) NOT NULL,
    [Value] nvarchar(max) NULL,
    CONSTRAINT [PK_UserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
    CONSTRAINT [FK_UserTokens_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Description', N'Name') AND [object_id] = OBJECT_ID(N'[Permissions]'))
    SET IDENTITY_INSERT [Permissions] ON;
INSERT INTO [Permissions] ([Id], [Description], [Name])
VALUES ('a7b8c9d0-e1f2-3456-ab23-456789012345', N'View users', N'Users.View'),
('b8c9d0e1-f2a3-4567-bc34-567890123456', N'Edit users', N'Users.Edit'),
('c9d0e1f2-a3b4-5678-cd45-678901234567', N'Delete users', N'Users.Delete'),
('d0e1f2a3-b4c5-6789-de56-789012345678', N'Manage roles and permissions', N'Roles.Manage'),
('d4e5f6a7-b8c9-0123-def1-234567890123', N'View orders', N'Orders.View'),
('e5f6a7b8-c9d0-1234-ef12-345678901234', N'Edit orders', N'Orders.Edit'),
('f6a7b8c9-d0e1-2345-f123-456789012345', N'Delete orders', N'Orders.Delete');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Description', N'Name') AND [object_id] = OBJECT_ID(N'[Permissions]'))
    SET IDENTITY_INSERT [Permissions] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ConcurrencyStamp', N'Description', N'Name', N'NormalizedName') AND [object_id] = OBJECT_ID(N'[Roles]'))
    SET IDENTITY_INSERT [Roles] ON;
INSERT INTO [Roles] ([Id], [ConcurrencyStamp], [Description], [Name], [NormalizedName])
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', N'e727cd96-79be-4860-9ff8-c4fcb0e267f6', N'Full system access', N'Admin', N'ADMIN'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', N'0002ffa9-791c-4d5a-874c-450a380349e4', N'Can view and edit records', N'Editor', N'EDITOR'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', N'8d31f82b-ad70-4602-a000-23e1e7f5d4f2', N'Read-only access', N'Viewer', N'VIEWER');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ConcurrencyStamp', N'Description', N'Name', N'NormalizedName') AND [object_id] = OBJECT_ID(N'[Roles]'))
    SET IDENTITY_INSERT [Roles] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'PermissionId', N'RoleId') AND [object_id] = OBJECT_ID(N'[RolePermissions]'))
    SET IDENTITY_INSERT [RolePermissions] ON;
INSERT INTO [RolePermissions] ([PermissionId], [RoleId])
VALUES ('a7b8c9d0-e1f2-3456-ab23-456789012345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('b8c9d0e1-f2a3-4567-bc34-567890123456', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('c9d0e1f2-a3b4-5678-cd45-678901234567', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('d0e1f2a3-b4c5-6789-de56-789012345678', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('d4e5f6a7-b8c9-0123-def1-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('e5f6a7b8-c9d0-1234-ef12-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('f6a7b8c9-d0e1-2345-f123-456789012345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('a7b8c9d0-e1f2-3456-ab23-456789012345', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),
('b8c9d0e1-f2a3-4567-bc34-567890123456', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),
('d4e5f6a7-b8c9-0123-def1-234567890123', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),
('e5f6a7b8-c9d0-1234-ef12-345678901234', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),
('a7b8c9d0-e1f2-3456-ab23-456789012345', 'c3d4e5f6-a7b8-9012-cdef-123456789012'),
('d4e5f6a7-b8c9-0123-def1-234567890123', 'c3d4e5f6-a7b8-9012-cdef-123456789012');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'PermissionId', N'RoleId') AND [object_id] = OBJECT_ID(N'[RolePermissions]'))
    SET IDENTITY_INSERT [RolePermissions] OFF;

CREATE UNIQUE INDEX [IX_Permissions_Name] ON [Permissions] ([Name]);

CREATE INDEX [IX_RefreshTokens_TokenHash] ON [RefreshTokens] ([TokenHash]);

CREATE INDEX [IX_RefreshTokens_UserId] ON [RefreshTokens] ([UserId]);

CREATE INDEX [IX_RoleClaims_RoleId] ON [RoleClaims] ([RoleId]);

CREATE INDEX [IX_RolePermissions_PermissionId] ON [RolePermissions] ([PermissionId]);

CREATE UNIQUE INDEX [RoleNameIndex] ON [Roles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;

CREATE INDEX [IX_UserClaims_UserId] ON [UserClaims] ([UserId]);

CREATE INDEX [IX_UserLogins_UserId] ON [UserLogins] ([UserId]);

CREATE INDEX [IX_UserRoles_RoleId] ON [UserRoles] ([RoleId]);

CREATE INDEX [EmailIndex] ON [Users] ([NormalizedEmail]);

CREATE UNIQUE INDEX [UserNameIndex] ON [Users] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260715182518_CreateAuthSchema', N'10.0.0-preview.2.25163.8');

CREATE TABLE [Brands] (
    [Id] uniqueidentifier NOT NULL,
    [Code] nvarchar(50) NOT NULL,
    [Name] nvarchar(256) NOT NULL,
    [Status] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_Brands] PRIMARY KEY ([Id])
);

CREATE TABLE [MainCategories] (
    [Id] uniqueidentifier NOT NULL,
    [Code] nvarchar(50) NOT NULL,
    [Name] nvarchar(256) NOT NULL,
    [Status] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_MainCategories] PRIMARY KEY ([Id])
);

CREATE TABLE [ProductGroups] (
    [Id] uniqueidentifier NOT NULL,
    [Code] nvarchar(50) NOT NULL,
    [Name] nvarchar(256) NOT NULL,
    [Status] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_ProductGroups] PRIMARY KEY ([Id])
);

CREATE TABLE [Transporters] (
    [Id] uniqueidentifier NOT NULL,
    [Code] nvarchar(50) NOT NULL,
    [Name] nvarchar(256) NOT NULL,
    [ContactNumber] nvarchar(50) NULL,
    [Status] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_Transporters] PRIMARY KEY ([Id])
);

CREATE TABLE [Warehouses] (
    [Id] uniqueidentifier NOT NULL,
    [Code] nvarchar(50) NOT NULL,
    [Name] nvarchar(256) NOT NULL,
    [Location] nvarchar(512) NULL,
    [Status] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_Warehouses] PRIMARY KEY ([Id])
);

CREATE TABLE [SubCategories] (
    [Id] uniqueidentifier NOT NULL,
    [Code] nvarchar(50) NOT NULL,
    [Name] nvarchar(256) NOT NULL,
    [Status] bit NOT NULL,
    [MainCategoryId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_SubCategories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SubCategories_MainCategories_MainCategoryId] FOREIGN KEY ([MainCategoryId]) REFERENCES [MainCategories] ([Id]) ON DELETE NO ACTION
);

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Description', N'Name') AND [object_id] = OBJECT_ID(N'[Permissions]'))
    SET IDENTITY_INSERT [Permissions] ON;
INSERT INTO [Permissions] ([Id], [Description], [Name])
VALUES ('e1f2a3b4-c5d6-7890-ef12-345678901234', N'View definitions', N'Definitions.View'),
('f2a3b4c5-d6e7-8901-f123-456789012345', N'Edit definitions', N'Definitions.Edit');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Description', N'Name') AND [object_id] = OBJECT_ID(N'[Permissions]'))
    SET IDENTITY_INSERT [Permissions] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'PermissionId', N'RoleId') AND [object_id] = OBJECT_ID(N'[RolePermissions]'))
    SET IDENTITY_INSERT [RolePermissions] ON;
INSERT INTO [RolePermissions] ([PermissionId], [RoleId])
VALUES ('e1f2a3b4-c5d6-7890-ef12-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('f2a3b4c5-d6e7-8901-f123-456789012345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('e1f2a3b4-c5d6-7890-ef12-345678901234', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),
('f2a3b4c5-d6e7-8901-f123-456789012345', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),
('e1f2a3b4-c5d6-7890-ef12-345678901234', 'c3d4e5f6-a7b8-9012-cdef-123456789012');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'PermissionId', N'RoleId') AND [object_id] = OBJECT_ID(N'[RolePermissions]'))
    SET IDENTITY_INSERT [RolePermissions] OFF;

CREATE UNIQUE INDEX [IX_Brands_Code] ON [Brands] ([Code]);

CREATE UNIQUE INDEX [IX_MainCategories_Code] ON [MainCategories] ([Code]);

CREATE UNIQUE INDEX [IX_ProductGroups_Code] ON [ProductGroups] ([Code]);

CREATE UNIQUE INDEX [IX_SubCategories_Code] ON [SubCategories] ([Code]);

CREATE INDEX [IX_SubCategories_MainCategoryId] ON [SubCategories] ([MainCategoryId]);

CREATE UNIQUE INDEX [IX_Transporters_Code] ON [Transporters] ([Code]);

CREATE UNIQUE INDEX [IX_Warehouses_Code] ON [Warehouses] ([Code]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260718202428_AddDefinitionTables', N'10.0.0-preview.2.25163.8');

EXEC sp_rename N'[Transporters].[ContactNumber]', N'Phone', 'COLUMN';

DECLARE @var sysname;
SELECT @var = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Warehouses]') AND [c].[name] = N'Status');
IF @var IS NOT NULL EXEC(N'ALTER TABLE [Warehouses] DROP CONSTRAINT [' + @var + '];');
ALTER TABLE [Warehouses] ALTER COLUMN [Status] nvarchar(20) NOT NULL;
ALTER TABLE [Warehouses] ADD DEFAULT N'Active' FOR [Status];

ALTER TABLE [Warehouses] ADD [CreatedBy] nvarchar(256) NOT NULL DEFAULT N'';

ALTER TABLE [Warehouses] ADD [DeletedAt] datetime2 NULL;

ALTER TABLE [Warehouses] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [Warehouses] ADD [UpdatedBy] nvarchar(256) NULL;

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Transporters]') AND [c].[name] = N'Status');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Transporters] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [Transporters] ALTER COLUMN [Status] nvarchar(20) NOT NULL;
ALTER TABLE [Transporters] ADD DEFAULT N'Active' FOR [Status];

ALTER TABLE [Transporters] ADD [Address] nvarchar(512) NULL;

ALTER TABLE [Transporters] ADD [ContactPerson] nvarchar(256) NULL;

ALTER TABLE [Transporters] ADD [CreatedBy] nvarchar(256) NOT NULL DEFAULT N'';

ALTER TABLE [Transporters] ADD [DeletedAt] datetime2 NULL;

ALTER TABLE [Transporters] ADD [Email] nvarchar(256) NULL;

ALTER TABLE [Transporters] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [Transporters] ADD [UpdatedBy] nvarchar(256) NULL;

DECLARE @var2 sysname;
SELECT @var2 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[SubCategories]') AND [c].[name] = N'Status');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [SubCategories] DROP CONSTRAINT [' + @var2 + '];');
ALTER TABLE [SubCategories] ALTER COLUMN [Status] nvarchar(20) NOT NULL;
ALTER TABLE [SubCategories] ADD DEFAULT N'Active' FOR [Status];

ALTER TABLE [SubCategories] ADD [CreatedBy] nvarchar(256) NOT NULL DEFAULT N'';

ALTER TABLE [SubCategories] ADD [DeletedAt] datetime2 NULL;

ALTER TABLE [SubCategories] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [SubCategories] ADD [UpdatedBy] nvarchar(256) NULL;

DECLARE @var3 sysname;
SELECT @var3 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ProductGroups]') AND [c].[name] = N'Status');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [ProductGroups] DROP CONSTRAINT [' + @var3 + '];');
ALTER TABLE [ProductGroups] ALTER COLUMN [Status] nvarchar(20) NOT NULL;
ALTER TABLE [ProductGroups] ADD DEFAULT N'Active' FOR [Status];

ALTER TABLE [ProductGroups] ADD [CreatedBy] nvarchar(256) NOT NULL DEFAULT N'';

ALTER TABLE [ProductGroups] ADD [DeletedAt] datetime2 NULL;

ALTER TABLE [ProductGroups] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [ProductGroups] ADD [UpdatedBy] nvarchar(256) NULL;

DECLARE @var4 sysname;
SELECT @var4 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[MainCategories]') AND [c].[name] = N'Status');
IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [MainCategories] DROP CONSTRAINT [' + @var4 + '];');
ALTER TABLE [MainCategories] ALTER COLUMN [Status] nvarchar(20) NOT NULL;
ALTER TABLE [MainCategories] ADD DEFAULT N'Active' FOR [Status];

ALTER TABLE [MainCategories] ADD [CreatedBy] nvarchar(256) NOT NULL DEFAULT N'';

ALTER TABLE [MainCategories] ADD [DeletedAt] datetime2 NULL;

ALTER TABLE [MainCategories] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [MainCategories] ADD [UpdatedBy] nvarchar(256) NULL;

DECLARE @var5 sysname;
SELECT @var5 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Brands]') AND [c].[name] = N'Status');
IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [Brands] DROP CONSTRAINT [' + @var5 + '];');
ALTER TABLE [Brands] ALTER COLUMN [Status] nvarchar(20) NOT NULL;
ALTER TABLE [Brands] ADD DEFAULT N'Active' FOR [Status];

ALTER TABLE [Brands] ADD [CreatedBy] nvarchar(256) NOT NULL DEFAULT N'';

ALTER TABLE [Brands] ADD [DeletedAt] datetime2 NULL;

ALTER TABLE [Brands] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [Brands] ADD [UpdatedBy] nvarchar(256) NULL;

CREATE TABLE [AuditLogs] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] nvarchar(256) NOT NULL,
    [Entity] nvarchar(256) NOT NULL,
    [EntityId] uniqueidentifier NOT NULL,
    [Action] nvarchar(50) NOT NULL,
    [OldValues] nvarchar(max) NULL,
    [NewValues] nvarchar(max) NULL,
    [IPAddress] nvarchar(50) NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    CONSTRAINT [PK_AuditLogs] PRIMARY KEY ([Id])
);

CREATE TABLE [ProductTypes] (
    [Id] uniqueidentifier NOT NULL,
    [Code] nvarchar(50) NOT NULL,
    [Name] nvarchar(256) NOT NULL,
    [CodePrefix] int NOT NULL,
    [Status] nvarchar(20) NOT NULL DEFAULT N'Active',
    [IsDeleted] bit NOT NULL,
    [DeletedAt] datetime2 NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [CreatedBy] nvarchar(256) NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] nvarchar(256) NULL,
    CONSTRAINT [PK_ProductTypes] PRIMARY KEY ([Id])
);

CREATE TABLE [Units] (
    [Id] uniqueidentifier NOT NULL,
    [Code] nvarchar(50) NOT NULL,
    [Name] nvarchar(256) NOT NULL,
    [ShortName] nvarchar(10) NOT NULL,
    [DecimalPlaces] int NOT NULL DEFAULT 2,
    [Status] nvarchar(20) NOT NULL DEFAULT N'Active',
    [IsDeleted] bit NOT NULL,
    [DeletedAt] datetime2 NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [CreatedBy] nvarchar(256) NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] nvarchar(256) NULL,
    CONSTRAINT [PK_Units] PRIMARY KEY ([Id])
);

CREATE TABLE [ProductTypeSequences] (
    [Id] uniqueidentifier NOT NULL,
    [ProductTypeId] uniqueidentifier NOT NULL,
    [LastNumber] int NOT NULL DEFAULT 0,
    [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    CONSTRAINT [PK_ProductTypeSequences] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ProductTypeSequences_ProductTypes_ProductTypeId] FOREIGN KEY ([ProductTypeId]) REFERENCES [ProductTypes] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Products] (
    [Id] uniqueidentifier NOT NULL,
    [ProductCode] nvarchar(20) NOT NULL,
    [Name] nvarchar(200) NOT NULL,
    [ProductTypeId] uniqueidentifier NOT NULL,
    [CategoryId] uniqueidentifier NOT NULL,
    [SubCategoryId] uniqueidentifier NULL,
    [BrandId] uniqueidentifier NULL,
    [ProductGroupId] uniqueidentifier NULL,
    [UnitId] uniqueidentifier NOT NULL,
    [Weight] decimal(18,4) NULL,
    [ThicknessGSM] decimal(18,4) NULL,
    [ColorScheme] nvarchar(100) NULL,
    [Status] nvarchar(20) NOT NULL DEFAULT N'Active',
    [IsDeleted] bit NOT NULL,
    [DeletedAt] datetime2 NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [CreatedBy] nvarchar(256) NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] nvarchar(256) NULL,
    CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Products_Brands_BrandId] FOREIGN KEY ([BrandId]) REFERENCES [Brands] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Products_MainCategories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [MainCategories] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Products_ProductGroups_ProductGroupId] FOREIGN KEY ([ProductGroupId]) REFERENCES [ProductGroups] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Products_ProductTypes_ProductTypeId] FOREIGN KEY ([ProductTypeId]) REFERENCES [ProductTypes] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Products_SubCategories_SubCategoryId] FOREIGN KEY ([SubCategoryId]) REFERENCES [SubCategories] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Products_Units_UnitId] FOREIGN KEY ([UnitId]) REFERENCES [Units] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Inventories] (
    [Id] uniqueidentifier NOT NULL,
    [ProductId] uniqueidentifier NOT NULL,
    [WarehouseId] uniqueidentifier NOT NULL,
    [QuantityOnHand] decimal(18,4) NOT NULL DEFAULT 0.0,
    [ReservedQuantity] decimal(18,4) NOT NULL DEFAULT 0.0,
    [AverageCost] decimal(18,4) NOT NULL DEFAULT 0.0,
    [MinStock] decimal(18,4) NULL,
    [MaxStock] decimal(18,4) NULL,
    [ReorderLevel] decimal(18,4) NULL,
    [AvailableQuantity] AS [QuantityOnHand] - [ReservedQuantity],
    [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    CONSTRAINT [PK_Inventories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Inventories_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Inventories_Warehouses_WarehouseId] FOREIGN KEY ([WarehouseId]) REFERENCES [Warehouses] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [InventoryTransactions] (
    [Id] uniqueidentifier NOT NULL,
    [ProductId] uniqueidentifier NOT NULL,
    [WarehouseId] uniqueidentifier NOT NULL,
    [TransactionType] nvarchar(50) NOT NULL,
    [ReferenceType] nvarchar(100) NULL,
    [ReferenceId] uniqueidentifier NULL,
    [Quantity] decimal(18,4) NOT NULL,
    [UnitCost] decimal(18,4) NOT NULL,
    [TransactionDate] datetime2 NOT NULL,
    [Remarks] nvarchar(500) NULL,
    [CreatedBy] nvarchar(256) NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    CONSTRAINT [PK_InventoryTransactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_InventoryTransactions_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_InventoryTransactions_Warehouses_WarehouseId] FOREIGN KEY ([WarehouseId]) REFERENCES [Warehouses] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [OpeningStocks] (
    [Id] uniqueidentifier NOT NULL,
    [ProductId] uniqueidentifier NOT NULL,
    [WarehouseId] uniqueidentifier NOT NULL,
    [Quantity] decimal(18,4) NOT NULL,
    [AverageCost] decimal(18,4) NOT NULL,
    [TransactionDate] datetime2 NOT NULL,
    [Remarks] nvarchar(500) NULL,
    [IsDeleted] bit NOT NULL,
    [DeletedAt] datetime2 NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [CreatedBy] nvarchar(256) NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedBy] nvarchar(256) NULL,
    CONSTRAINT [PK_OpeningStocks] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_OpeningStocks_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_OpeningStocks_Warehouses_WarehouseId] FOREIGN KEY ([WarehouseId]) REFERENCES [Warehouses] ([Id]) ON DELETE NO ACTION
);

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CodePrefix', N'CreatedAt', N'CreatedBy', N'DeletedAt', N'IsDeleted', N'Name', N'Status', N'UpdatedAt', N'UpdatedBy') AND [object_id] = OBJECT_ID(N'[ProductTypes]'))
    SET IDENTITY_INSERT [ProductTypes] ON;
INSERT INTO [ProductTypes] ([Id], [Code], [CodePrefix], [CreatedAt], [CreatedBy], [DeletedAt], [IsDeleted], [Name], [Status], [UpdatedAt], [UpdatedBy])
VALUES ('a1b2c3d4-0001-0000-0000-000000000001', N'RAW', 1000000, '2025-01-01T00:00:00.0000000Z', N'system', NULL, CAST(0 AS bit), N'Raw Material', N'Active', NULL, NULL),
('a1b2c3d4-0001-0000-0000-000000000002', N'FIN', 2000000, '2025-01-01T00:00:00.0000000Z', N'system', NULL, CAST(0 AS bit), N'Finished Goods', N'Active', NULL, NULL),
('a1b2c3d4-0001-0000-0000-000000000003', N'SEMI', 3000000, '2025-01-01T00:00:00.0000000Z', N'system', NULL, CAST(0 AS bit), N'Semi Finished', N'Active', NULL, NULL),
('a1b2c3d4-0001-0000-0000-000000000004', N'PACK', 4000000, '2025-01-01T00:00:00.0000000Z', N'system', NULL, CAST(0 AS bit), N'Packing Material', N'Active', NULL, NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CodePrefix', N'CreatedAt', N'CreatedBy', N'DeletedAt', N'IsDeleted', N'Name', N'Status', N'UpdatedAt', N'UpdatedBy') AND [object_id] = OBJECT_ID(N'[ProductTypes]'))
    SET IDENTITY_INSERT [ProductTypes] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'CreatedBy', N'DeletedAt', N'IsDeleted', N'Name', N'ShortName', N'Status', N'UpdatedAt', N'UpdatedBy') AND [object_id] = OBJECT_ID(N'[Units]'))
    SET IDENTITY_INSERT [Units] ON;
INSERT INTO [Units] ([Id], [Code], [CreatedAt], [CreatedBy], [DeletedAt], [IsDeleted], [Name], [ShortName], [Status], [UpdatedAt], [UpdatedBy])
VALUES ('c3d4e5f6-0003-0000-0000-000000000001', N'PCS', '2025-01-01T00:00:00.0000000Z', N'system', NULL, CAST(0 AS bit), N'Piece', N'PCS', N'Active', NULL, NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'CreatedBy', N'DeletedAt', N'IsDeleted', N'Name', N'ShortName', N'Status', N'UpdatedAt', N'UpdatedBy') AND [object_id] = OBJECT_ID(N'[Units]'))
    SET IDENTITY_INSERT [Units] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'CreatedBy', N'DecimalPlaces', N'DeletedAt', N'IsDeleted', N'Name', N'ShortName', N'Status', N'UpdatedAt', N'UpdatedBy') AND [object_id] = OBJECT_ID(N'[Units]'))
    SET IDENTITY_INSERT [Units] ON;
INSERT INTO [Units] ([Id], [Code], [CreatedAt], [CreatedBy], [DecimalPlaces], [DeletedAt], [IsDeleted], [Name], [ShortName], [Status], [UpdatedAt], [UpdatedBy])
VALUES ('c3d4e5f6-0003-0000-0000-000000000002', N'KG', '2025-01-01T00:00:00.0000000Z', N'system', 3, NULL, CAST(0 AS bit), N'Kilogram', N'KG', N'Active', NULL, NULL),
('c3d4e5f6-0003-0000-0000-000000000003', N'LTR', '2025-01-01T00:00:00.0000000Z', N'system', 3, NULL, CAST(0 AS bit), N'Litre', N'LTR', N'Active', NULL, NULL),
('c3d4e5f6-0003-0000-0000-000000000004', N'MTR', '2025-01-01T00:00:00.0000000Z', N'system', 2, NULL, CAST(0 AS bit), N'Metre', N'MTR', N'Active', NULL, NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'CreatedBy', N'DecimalPlaces', N'DeletedAt', N'IsDeleted', N'Name', N'ShortName', N'Status', N'UpdatedAt', N'UpdatedBy') AND [object_id] = OBJECT_ID(N'[Units]'))
    SET IDENTITY_INSERT [Units] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'CreatedBy', N'DeletedAt', N'IsDeleted', N'Name', N'ShortName', N'Status', N'UpdatedAt', N'UpdatedBy') AND [object_id] = OBJECT_ID(N'[Units]'))
    SET IDENTITY_INSERT [Units] ON;
INSERT INTO [Units] ([Id], [Code], [CreatedAt], [CreatedBy], [DeletedAt], [IsDeleted], [Name], [ShortName], [Status], [UpdatedAt], [UpdatedBy])
VALUES ('c3d4e5f6-0003-0000-0000-000000000005', N'BOX', '2025-01-01T00:00:00.0000000Z', N'system', NULL, CAST(0 AS bit), N'Box', N'BOX', N'Active', NULL, NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'CreatedBy', N'DeletedAt', N'IsDeleted', N'Name', N'ShortName', N'Status', N'UpdatedAt', N'UpdatedBy') AND [object_id] = OBJECT_ID(N'[Units]'))
    SET IDENTITY_INSERT [Units] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'CreatedBy', N'DecimalPlaces', N'DeletedAt', N'IsDeleted', N'Name', N'ShortName', N'Status', N'UpdatedAt', N'UpdatedBy') AND [object_id] = OBJECT_ID(N'[Units]'))
    SET IDENTITY_INSERT [Units] ON;
INSERT INTO [Units] ([Id], [Code], [CreatedAt], [CreatedBy], [DecimalPlaces], [DeletedAt], [IsDeleted], [Name], [ShortName], [Status], [UpdatedAt], [UpdatedBy])
VALUES ('c3d4e5f6-0003-0000-0000-000000000006', N'GM', '2025-01-01T00:00:00.0000000Z', N'system', 3, NULL, CAST(0 AS bit), N'Gram', N'GM', N'Active', NULL, NULL),
('c3d4e5f6-0003-0000-0000-000000000007', N'TON', '2025-01-01T00:00:00.0000000Z', N'system', 3, NULL, CAST(0 AS bit), N'Ton', N'TON', N'Active', NULL, NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'CreatedBy', N'DecimalPlaces', N'DeletedAt', N'IsDeleted', N'Name', N'ShortName', N'Status', N'UpdatedAt', N'UpdatedBy') AND [object_id] = OBJECT_ID(N'[Units]'))
    SET IDENTITY_INSERT [Units] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ProductTypeId', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[ProductTypeSequences]'))
    SET IDENTITY_INSERT [ProductTypeSequences] ON;
INSERT INTO [ProductTypeSequences] ([Id], [ProductTypeId], [UpdatedAt])
VALUES ('b2c3d4e5-0002-0000-0000-000000000001', 'a1b2c3d4-0001-0000-0000-000000000001', '2025-01-01T00:00:00.0000000Z'),
('b2c3d4e5-0002-0000-0000-000000000002', 'a1b2c3d4-0001-0000-0000-000000000002', '2025-01-01T00:00:00.0000000Z'),
('b2c3d4e5-0002-0000-0000-000000000003', 'a1b2c3d4-0001-0000-0000-000000000003', '2025-01-01T00:00:00.0000000Z'),
('b2c3d4e5-0002-0000-0000-000000000004', 'a1b2c3d4-0001-0000-0000-000000000004', '2025-01-01T00:00:00.0000000Z');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ProductTypeId', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[ProductTypeSequences]'))
    SET IDENTITY_INSERT [ProductTypeSequences] OFF;

CREATE INDEX [IX_AuditLogs_Entity] ON [AuditLogs] ([Entity]);

CREATE INDEX [IX_AuditLogs_EntityId] ON [AuditLogs] ([EntityId]);

CREATE INDEX [IX_AuditLogs_UserId] ON [AuditLogs] ([UserId]);

CREATE UNIQUE INDEX [IX_Inventories_ProductId_WarehouseId] ON [Inventories] ([ProductId], [WarehouseId]);

CREATE INDEX [IX_Inventories_WarehouseId] ON [Inventories] ([WarehouseId]);

CREATE INDEX [IX_InventoryTransactions_ProductId] ON [InventoryTransactions] ([ProductId]);

CREATE INDEX [IX_InventoryTransactions_TransactionDate] ON [InventoryTransactions] ([TransactionDate]);

CREATE INDEX [IX_InventoryTransactions_TransactionType] ON [InventoryTransactions] ([TransactionType]);

CREATE INDEX [IX_InventoryTransactions_WarehouseId] ON [InventoryTransactions] ([WarehouseId]);

CREATE INDEX [IX_OpeningStocks_ProductId] ON [OpeningStocks] ([ProductId]);

CREATE INDEX [IX_OpeningStocks_WarehouseId] ON [OpeningStocks] ([WarehouseId]);

CREATE INDEX [IX_Products_BrandId] ON [Products] ([BrandId]);

CREATE INDEX [IX_Products_CategoryId] ON [Products] ([CategoryId]);

CREATE UNIQUE INDEX [IX_Products_ProductCode] ON [Products] ([ProductCode]);

CREATE INDEX [IX_Products_ProductGroupId] ON [Products] ([ProductGroupId]);

CREATE INDEX [IX_Products_ProductTypeId] ON [Products] ([ProductTypeId]);

CREATE INDEX [IX_Products_SubCategoryId] ON [Products] ([SubCategoryId]);

CREATE INDEX [IX_Products_UnitId] ON [Products] ([UnitId]);

CREATE UNIQUE INDEX [IX_ProductTypes_Code] ON [ProductTypes] ([Code]);

CREATE UNIQUE INDEX [IX_ProductTypeSequences_ProductTypeId] ON [ProductTypeSequences] ([ProductTypeId]);

CREATE UNIQUE INDEX [IX_Units_Code] ON [Units] ([Code]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260725080431_AddAllNewModules', N'10.0.0-preview.2.25163.8');

COMMIT;
GO

