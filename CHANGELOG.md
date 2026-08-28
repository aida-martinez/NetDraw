# Changelog

All notable changes to the NetDraw plugin will be documented in this file.

## [1.1.0] - 2026-08-28

### Added
- **Qualifying Draw** support: choose Standard or Qualifying draws with configurable Main Draw Qualifying Spots (2, 4, 8, ...).
- Qualifying brackets truncate automatically at the round where remaining winners equal the qualifying spots.
- **Qualified (Q)** advancement badges and a dedicated Qualifying Round label in both the admin editor and the frontend bracket.
- Preserves hidden bracket data so switching between draw types is non-destructive.

### Fixed
- Fixed multiple shortcodes on the same page each rendering their own bracket instead of always showing the last one.

## [1.0.1] - 2026-07-23

### Added
- Spanish, French, Italian, and Galician translations.
- Localized admin and frontend JavaScript assets.

## [1.0.0] - 2026-07-18

### Added
- Custom Post Type for tournaments.
- Admin bracket editor with dynamic grid and automatic progression.
- Frontend visual bracket with path highlighting via shortcode.
- Responsive CSS tree layout with no external dependencies.
